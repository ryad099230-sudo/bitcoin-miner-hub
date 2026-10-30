CREATE UNIQUE INDEX IF NOT EXISTS deposits_hash_normalized_unique ON public.deposits (lower(tx_hash)) WHERE tx_hash IS NOT NULL AND trim(tx_hash) <> '';
CREATE OR REPLACE FUNCTION public.validate_deposit_confirmation() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE required_count integer;
BEGIN
  IF OLD.status = 'confirmed' AND NEW IS DISTINCT FROM OLD THEN RAISE EXCEPTION 'confirmed deposit is immutable'; END IF;
  IF NEW.status = 'confirmed' AND OLD.status <> 'confirmed' THEN
    IF OLD.status IN ('rejected','expired') OR OLD.expires_at <= now() THEN RAISE EXCEPTION 'deposit is closed or expired'; END IF;
    IF NEW.tx_hash IS NULL OR NEW.tx_hash !~ '^[A-Fa-f0-9]{64}$' THEN RAISE EXCEPTION 'invalid tx hash'; END IF;
    IF NEW.received_amount IS NULL OR NEW.received_amount < OLD.expected_amount THEN RAISE EXCEPTION 'insufficient received amount'; END IF;
    IF NEW.usd_value IS NULL OR NEW.usd_value <= 0 THEN RAISE EXCEPTION 'USD value required'; END IF;
    SELECT required_confirmations INTO required_count FROM public.supported_networks WHERE id = OLD.network_id;
    IF required_count IS NULL OR required_count < 1 OR NEW.confirmations < required_count THEN RAISE EXCEPTION 'required confirmations not reached'; END IF;
    NEW.tx_hash := lower(NEW.tx_hash);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_validate_deposit_confirmation BEFORE UPDATE ON public.deposits FOR EACH ROW EXECUTE FUNCTION public.validate_deposit_confirmation();
CREATE OR REPLACE FUNCTION public.notify_deposit_problem() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status IN ('rejected','expired') THEN
    INSERT INTO public.notifications(user_id,title,body) VALUES (NEW.user_id,'Deposit ' || NEW.status,NEW.reference || coalesce(' · ' || NEW.reject_reason,''));
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_notify_deposit_problem AFTER UPDATE ON public.deposits FOR EACH ROW EXECUTE FUNCTION public.notify_deposit_problem();