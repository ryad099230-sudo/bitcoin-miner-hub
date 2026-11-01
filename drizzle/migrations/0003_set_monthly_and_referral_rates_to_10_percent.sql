-- Set the published monthly target and one-time referral commission rate.
-- This migration changes configuration only; it does not enable deposits or withdrawals.
alter table public.site_settings
  alter column calculator_monthly_rate set default 0.10,
  alter column referral_rate set default 0.10;

update public.site_settings
set calculator_monthly_rate = 0.10,
    referral_rate = 0.10,
    updated_at = now()
where id = 1;
