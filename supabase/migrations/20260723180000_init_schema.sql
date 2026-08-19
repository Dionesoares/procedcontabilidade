-- ProcedContabilidade: initial Supabase schema migration
-- Replaces the Base44 entities/auth model with Postgres tables, RLS policies,
-- and Supabase Auth-backed profiles.

-- ============================================================================
-- Extensions
-- ============================================================================
create extension if not exists pgcrypto;

-- ============================================================================
-- Helper functions
-- ============================================================================

-- Generic updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- profiles (replaces Base44 User entity; 1:1 with auth.users)
-- ============================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  legacy_id text unique,
  email text,
  role text not null default 'user' check (role in ('admin', 'contador', 'user')),
  display_name text,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, full_name)
  values (new.id, new.email, 'user', new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- Returns true when the current user is admin or contador (staff)
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'contador')
  );
$$;

-- Returns true when the current user is admin only
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================================
-- clients
-- ============================================================================
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  name text not null,
  email text not null,
  phone text,
  cpf_cnpj text not null,
  company_name text,
  company_type text,
  status text not null default 'Pendente' check (status in ('Ativo', 'Inativo', 'Pendente')),
  address text,
  notes text,
  user_id uuid references public.profiles(id) on delete set null,
  access_password text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_clients_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

create index idx_clients_user_id on public.clients(user_id);

-- ============================================================================
-- tasks
-- ============================================================================
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  title text not null,
  description text,
  client_id uuid not null references public.clients(id) on delete cascade,
  due_date date,
  priority text default 'Média' check (priority in ('Baixa', 'Média', 'Alta', 'Urgente')),
  status text default 'Pendente' check (status in ('Pendente', 'Em Andamento', 'Concluída')),
  category text check (category in ('Fiscal', 'Contábil', 'Trabalhista', 'Societário', 'MEI', 'Outros')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

create index idx_tasks_client_id on public.tasks(client_id);

-- ============================================================================
-- service_requests (public form can insert without auth)
-- ============================================================================
create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  service_type text not null,
  description text,
  client_id uuid references public.clients(id) on delete set null,
  status text not null default 'Novo' check (status in ('Novo', 'Em Análise', 'Em Andamento', 'Concluído', 'Cancelado')),
  client_name text not null,
  client_email text,
  client_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_service_requests_updated_at
  before update on public.service_requests
  for each row execute function public.set_updated_at();

create index idx_service_requests_client_id on public.service_requests(client_id);

-- ============================================================================
-- messages
-- ============================================================================
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  subject text,
  content text not null,
  client_id uuid not null references public.clients(id) on delete cascade,
  sender_type text not null check (sender_type in ('client', 'admin')),
  sender_name text,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_messages_updated_at
  before update on public.messages
  for each row execute function public.set_updated_at();

create index idx_messages_client_id on public.messages(client_id);

-- ============================================================================
-- financial_records
-- ============================================================================
create table public.financial_records (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  description text not null,
  type text not null check (type in ('Receita', 'Despesa')),
  amount numeric not null,
  due_date date,
  status text default 'Pendente' check (status in ('Pendente', 'Pago', 'Atrasado')),
  client_id uuid references public.clients(id) on delete set null,
  client_name text,
  read_by_client boolean not null default false,
  type_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_financial_records_updated_at
  before update on public.financial_records
  for each row execute function public.set_updated_at();

create index idx_financial_records_client_id on public.financial_records(client_id);

-- ============================================================================
-- document_folders
-- ============================================================================
create table public.document_folders (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  name text not null,
  client_id uuid references public.clients(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_document_folders_updated_at
  before update on public.document_folders
  for each row execute function public.set_updated_at();

create index idx_document_folders_client_id on public.document_folders(client_id);

-- ============================================================================
-- documents
-- ============================================================================
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  title text not null,
  description text,
  category text check (category in ('Fiscal', 'Contábil', 'Trabalhista', 'Societário', 'Outros')),
  file_url text,
  storage_path text,
  client_id uuid not null references public.clients(id) on delete cascade,
  folder_id uuid references public.document_folders(id) on delete set null,
  status text default 'Pendente' check (status in ('Pendente', 'Enviado', 'Aprovado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_documents_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();

create index idx_documents_client_id on public.documents(client_id);
create index idx_documents_folder_id on public.documents(folder_id);

-- ============================================================================
-- contracts
-- ============================================================================
create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  client_id uuid not null references public.clients(id) on delete cascade,
  client_name text,
  content text not null,
  signature_name text,
  status text default 'Pendente' check (status in ('Pendente', 'Assinado')),
  signed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_contracts_updated_at
  before update on public.contracts
  for each row execute function public.set_updated_at();

create index idx_contracts_client_id on public.contracts(client_id);

-- ============================================================================
-- contador_invites
-- ============================================================================
create table public.contador_invites (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  name text,
  email text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_contador_invites_updated_at
  before update on public.contador_invites
  for each row execute function public.set_updated_at();

create unique index idx_contador_invites_email on public.contador_invites(lower(email));

-- ============================================================================
-- contact_submissions (public form can insert without auth)
-- ============================================================================
create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  name text not null,
  email text not null,
  phone text,
  message text not null,
  service_interest text,
  status text not null default 'Novo' check (status in ('Novo', 'Em Análise', 'Respondido', 'Arquivado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_contact_submissions_updated_at
  before update on public.contact_submissions
  for each row execute function public.set_updated_at();

-- ============================================================================
-- tipos_lancamento (financeiro lookup)
-- ============================================================================
create table public.tipos_lancamento (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  label text not null,
  classification text not null default 'Receita' check (classification in ('Receita', 'Despesa')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_tipos_lancamento_updated_at
  before update on public.tipos_lancamento
  for each row execute function public.set_updated_at();

-- ============================================================================
-- descricoes_lancamento (financeiro lookup)
-- ============================================================================
create table public.descricoes_lancamento (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  label text not null,
  scope text not null default 'lancamento' check (scope in ('lancamento', 'cobranca')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_descricoes_lancamento_updated_at
  before update on public.descricoes_lancamento
  for each row execute function public.set_updated_at();

-- ============================================================================
-- contas_contabil (chart of accounts lookup, currently unused by frontend)
-- ============================================================================
create table public.contas_contabil (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  label text not null,
  grupo text not null check (grupo in ('ativo', 'passivo', 'despesas', 'receitas')),
  base_categoria text,
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_contas_contabil_updated_at
  before update on public.contas_contabil
  for each row execute function public.set_updated_at();

-- ============================================================================
-- balancetes (currently unused by frontend, kept for parity)
-- ============================================================================
create table public.balancetes (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  client_id uuid not null references public.clients(id) on delete cascade,
  client_name text,
  client_company_name text,
  client_cnpj text,
  client_address text,
  folha text default '0001',
  numero_livro text default '0001',
  period_start date not null,
  period_end date not null,
  tree jsonb,
  ativo_saldo numeric default 0,
  passivo_saldo numeric default 0,
  despesas_saldo numeric default 0,
  receitas_saldo numeric default 0,
  signature_contador text,
  signature_contador_crc text,
  signature_contador_cpf text,
  signature_cliente text,
  signature_cliente_role text default 'Sócio Proprietário',
  signature_cliente_cpf text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_balancetes_updated_at
  before update on public.balancetes
  for each row execute function public.set_updated_at();

create index idx_balancetes_client_id on public.balancetes(client_id);

-- ============================================================================
-- balancete_lancamentos (currently unused by frontend, kept for parity)
-- ============================================================================
create table public.balancete_lancamentos (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  client_id uuid not null references public.clients(id) on delete cascade,
  client_name text,
  categoria text not null,
  descricao text,
  tipo text not null default 'Débito' check (tipo in ('Débito', 'Crédito')),
  amount numeric not null,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_balancete_lancamentos_updated_at
  before update on public.balancete_lancamentos
  for each row execute function public.set_updated_at();

create index idx_balancete_lancamentos_client_id on public.balancete_lancamentos(client_id);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.tasks enable row level security;
alter table public.service_requests enable row level security;
alter table public.messages enable row level security;
alter table public.financial_records enable row level security;
alter table public.document_folders enable row level security;
alter table public.documents enable row level security;
alter table public.contracts enable row level security;
alter table public.contador_invites enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.tipos_lancamento enable row level security;
alter table public.descricoes_lancamento enable row level security;
alter table public.contas_contabil enable row level security;
alter table public.balancetes enable row level security;
alter table public.balancete_lancamentos enable row level security;

-- profiles: everyone can read their own profile; staff can read/update all
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());
create policy "profiles_select_staff" on public.profiles
  for select using (public.is_staff());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());
create policy "profiles_update_staff" on public.profiles
  for update using (public.is_staff());
create policy "profiles_delete_staff" on public.profiles
  for delete using (public.is_staff());

-- clients: staff full access; client can read own record
create policy "clients_all_staff" on public.clients
  for all using (public.is_staff()) with check (public.is_staff());
create policy "clients_select_own" on public.clients
  for select using (user_id = auth.uid());

-- tasks: staff full access; client can read own
create policy "tasks_all_staff" on public.tasks
  for all using (public.is_staff()) with check (public.is_staff());
create policy "tasks_select_own" on public.tasks
  for select using (
    client_id in (select id from public.clients where user_id = auth.uid())
  );

-- service_requests: staff full access; public/anon can create; client can read/create/delete own
create policy "service_requests_all_staff" on public.service_requests
  for all using (public.is_staff()) with check (public.is_staff());
create policy "service_requests_insert_public" on public.service_requests
  for insert with check (true);
create policy "service_requests_select_own" on public.service_requests
  for select using (
    client_id in (select id from public.clients where user_id = auth.uid())
  );
create policy "service_requests_delete_own" on public.service_requests
  for delete using (
    client_id in (select id from public.clients where user_id = auth.uid())
  );

-- messages: staff full access; client can read/create own
create policy "messages_all_staff" on public.messages
  for all using (public.is_staff()) with check (public.is_staff());
create policy "messages_select_own" on public.messages
  for select using (
    client_id in (select id from public.clients where user_id = auth.uid())
  );
create policy "messages_insert_own" on public.messages
  for insert with check (
    client_id in (select id from public.clients where user_id = auth.uid())
  );

-- financial_records: staff full access; client can read own
create policy "financial_records_all_staff" on public.financial_records
  for all using (public.is_staff()) with check (public.is_staff());
create policy "financial_records_select_own" on public.financial_records
  for select using (
    client_id in (select id from public.clients where user_id = auth.uid())
  );
create policy "financial_records_update_own_read" on public.financial_records
  for update using (
    client_id in (select id from public.clients where user_id = auth.uid())
  ) with check (
    client_id in (select id from public.clients where user_id = auth.uid())
  );

-- document_folders: staff full access; client can read own
create policy "document_folders_all_staff" on public.document_folders
  for all using (public.is_staff()) with check (public.is_staff());
create policy "document_folders_select_own" on public.document_folders
  for select using (
    client_id in (select id from public.clients where user_id = auth.uid())
  );

-- documents: staff full access; client can read own
create policy "documents_all_staff" on public.documents
  for all using (public.is_staff()) with check (public.is_staff());
create policy "documents_select_own" on public.documents
  for select using (
    client_id in (select id from public.clients where user_id = auth.uid())
  );

-- contracts: staff full access; client can read/update (sign) own
create policy "contracts_all_staff" on public.contracts
  for all using (public.is_staff()) with check (public.is_staff());
create policy "contracts_select_own" on public.contracts
  for select using (
    client_id in (select id from public.clients where user_id = auth.uid())
  );
create policy "contracts_update_own" on public.contracts
  for update using (
    client_id in (select id from public.clients where user_id = auth.uid())
  ) with check (
    client_id in (select id from public.clients where user_id = auth.uid())
  );

-- contador_invites: staff only
create policy "contador_invites_all_staff" on public.contador_invites
  for all using (public.is_staff()) with check (public.is_staff());

-- contact_submissions: staff full access; public/anon can create
create policy "contact_submissions_all_staff" on public.contact_submissions
  for all using (public.is_staff()) with check (public.is_staff());
create policy "contact_submissions_insert_public" on public.contact_submissions
  for insert with check (true);

-- lookups: staff only
create policy "tipos_lancamento_all_staff" on public.tipos_lancamento
  for all using (public.is_staff()) with check (public.is_staff());
create policy "descricoes_lancamento_all_staff" on public.descricoes_lancamento
  for all using (public.is_staff()) with check (public.is_staff());
create policy "contas_contabil_all_staff" on public.contas_contabil
  for all using (public.is_staff()) with check (public.is_staff());

-- balancetes / balancete_lancamentos: staff full access; client can read own
create policy "balancetes_all_staff" on public.balancetes
  for all using (public.is_staff()) with check (public.is_staff());
create policy "balancetes_select_own" on public.balancetes
  for select using (
    client_id in (select id from public.clients where user_id = auth.uid())
  );
create policy "balancete_lancamentos_all_staff" on public.balancete_lancamentos
  for all using (public.is_staff()) with check (public.is_staff());
create policy "balancete_lancamentos_select_own" on public.balancete_lancamentos
  for select using (
    client_id in (select id from public.clients where user_id = auth.uid())
  );

-- ============================================================================
-- Storage bucket for client documents
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Storage layout: documents/{client_id}/{filename}
create policy "documents_storage_staff" on storage.objects
  for all using (bucket_id = 'documents' and public.is_staff())
  with check (bucket_id = 'documents' and public.is_staff());

create policy "documents_storage_select_own" on storage.objects
  for select using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] in (
      select id::text from public.clients where user_id = auth.uid()
    )
  );
