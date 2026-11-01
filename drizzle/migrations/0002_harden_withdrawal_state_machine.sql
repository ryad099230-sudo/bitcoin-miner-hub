-- Enforce a strict withdrawal state machine and make reservation release single-shot.
-- This migration changes database workflow rules only; it does not enable withdrawals.

CREATE OR REPLACE FUNCTION public.admin_update_withdrawal(
  _id uuid,
  _status public.withdrawal_status,
  _tx_hash text,
  _reason text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  w public.withdrawals;
  clean_hash text := nullif(lower(trim(coalesce(_tx_hash, ''))), '');
  clean_reason text := nullif(trim(coalesce(_reason, '')), '');
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT * INTO w
  FROM public.withdrawals
  WHERE id = _id
  FOR UPDATE;

  IF w.id IS NULL THEN
    RAISE EXCEPTION 'withdrawal not found';
  END IF;

  IF w.status IN ('completed', 'rejected', 'cancelled') THEN
    RAISE EXCEPTION 'withdrawal is closed';
  END IF;

  IF _status = w.status THEN
    RAISE EXCEPTION 'withdrawal status is unchanged';
  END IF;

  -- Only the following transitions are permitted:
  -- requested -> approved | rejected | cancelled
  -- approved  -> broadcast | rejected | cancelled
  -- broadcast -> completed
  IF NOT (
    (w.status = 'requested' AND _status IN ('approved', 'rejected', 'cancelled'))
    OR (w.status = 'approved' AND _status IN ('broadcast', 'rejected', 'cancelled'))
    OR (w.status = 'broadcast' AND _status = 'completed')
  ) THEN
    RAISE EXCEPTION 'invalid withdrawal transition: % -> %', w.status, _status;
  END IF;

  IF _status IN ('rejected', 'cancelled') AND clean_reason IS NULL THEN
    RAISE EXCEPTION 'reason required for rejected or cancelled withdrawal';
  END IF;

  IF _status = 'broadcast' THEN
    IF clean_hash IS NULL OR clean_hash !~ '^[a-f0-9]{64}$' THEN
      RAISE EXCEPTION 'valid transaction hash required before broadcast';
    END IF;
  ELSIF _status = 'completed' THEN
    IF coalesce(clean_hash, w.tx_hash, '') !~ '^[a-f0-9]{64}$' THEN
      RAISE EXCEPTION 'valid transaction hash required to complete withdrawal';
    END IF;
    IF clean_hash IS NOT NULL AND w.tx_hash IS NOT NULL AND clean_hash <> lower(w.tx_hash) THEN
      RAISE EXCEPTION 'transaction hash cannot be changed after broadcast';
    END IF;
  END IF;

  UPDATE public.withdrawals
  SET status = _status,
      tx_hash = CASE
        WHEN _status = 'broadcast' THEN clean_hash
        WHEN _status = 'completed' THEN coalesce(clean_hash, tx_hash)
        ELSE tx_hash
      END,
      reject_reason = CASE
        WHEN _status IN ('rejected', 'cancelled') THEN clean_reason
        ELSE reject_reason
      END,
      reviewed_by = auth.uid(),
      updated_at = now()
  WHERE id = _id;

  -- Reservation is released only on a valid pre-broadcast terminal path.
  -- The row lock plus terminal-state guard prevents duplicate releases.
  IF _status IN ('rejected', 'cancelled') THEN
    INSERT INTO public.ledger_entries(user_id, kind, amount_usd, ref_type, ref_id)
    VALUES (w.user_id, 'withdrawal_release', w.amount_usd + w.fee_usd, 'withdrawal', w.id);
  END IF;

  INSERT INTO public.notifications(user_id, title, body)
  VALUES (w.user_id, 'Withdrawal ' || _status, '$' || w.amount_usd);

  PERFORM public.write_audit(
    'withdrawal.' || _status,
    'withdrawal',
    _id::text,
    jsonb_build_object('tx', coalesce(clean_hash, w.tx_hash), 'reason', clean_reason)
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_update_withdrawal(uuid, public.withdrawal_status, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_update_withdrawal(uuid, public.withdrawal_status, text, text) TO authenticated;
