-- Tracks partial client payments so a launch can stay open when the
-- received amount is less than the billed amount.
alter table public.financial_records
  drop constraint if exists financial_records_status_check;

alter table public.financial_records
  add column if not exists amount_paid numeric not null default 0;

alter table public.financial_records
  add constraint financial_records_status_check
  check (status in ('Pendente', 'Pago', 'Atrasado', 'Parcial'));
