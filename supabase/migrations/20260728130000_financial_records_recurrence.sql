-- Adds recurrence support to financial_records so a single "Novo Lançamento"
-- submission can generate several future occurrences (e.g. a monthly fee),
-- grouped together for later identification/management.
alter table public.financial_records
  add column is_recurring boolean not null default false,
  add column recurrence_group_id uuid,
  add column recurrence_frequency text check (recurrence_frequency in ('Semanal', 'Mensal', 'Anual'));

create index idx_financial_records_recurrence_group_id on public.financial_records(recurrence_group_id);
