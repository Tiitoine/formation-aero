-- =====================================================================
-- Formation Préparateur Méthodes Assemblage — Synchronisation multi-PC
-- À exécuter UNE FOIS dans Supabase : SQL Editor > New query > Run.
--
-- Modèle « journal d'événements » : on n'écrase jamais une ligne, on ajoute.
-- Sécurité par Row Level Security (RLS) :
--   * rôle anon (clé publique intégrée au site) : peut SEULEMENT ajouter un
--     profil ou une tentative, et relire SON parcours via ah_events_stagiaire ;
--   * administrateurs (comptes Supabase Auth listés dans ah_admins) : lecture
--     de toute la promotion, décisions, fiches, suppressions.
-- =====================================================================

create table if not exists public.ah_events (
  id          text primary key,
  type        text not null check (type in ('profil','tentative','decision','fiche','suppression','reglage')),
  cle         text not null,
  student_id  text,
  payload     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists ah_events_cle_idx on public.ah_events (cle);
create index if not exists ah_events_student_idx on public.ah_events (student_id);

-- Liste des administrateurs (formateurs) autorisés
create table if not exists public.ah_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email   text,
  added_at timestamptz not null default now()
);

alter table public.ah_events enable row level security;
alter table public.ah_admins enable row level security;

create or replace function public.ah_is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.ah_admins where user_id = auth.uid());
$$;

-- Nettoyage des anciennes règles en cas de ré-exécution
drop policy if exists ah_events_insert_anon   on public.ah_events;
drop policy if exists ah_events_admin_select  on public.ah_events;
drop policy if exists ah_events_admin_insert  on public.ah_events;
drop policy if exists ah_events_admin_delete  on public.ah_events;
drop policy if exists ah_admins_self          on public.ah_admins;

-- Stagiaires (clé anon) : ajout de profil / tentative uniquement, taille limitée
create policy ah_events_insert_anon on public.ah_events
  for insert to anon, authenticated
  with check (type in ('profil','tentative') and pg_column_size(payload) < 200000);

-- Administrateurs : tout lire, tout ajouter, supprimer
create policy ah_events_admin_select on public.ah_events
  for select to authenticated using (public.ah_is_admin());
create policy ah_events_admin_insert on public.ah_events
  for insert to authenticated with check (public.ah_is_admin());
create policy ah_events_admin_delete on public.ah_events
  for delete to authenticated using (public.ah_is_admin());

create policy ah_admins_self on public.ah_admins
  for select to authenticated using (user_id = auth.uid());

-- Aucune mise à jour (UPDATE) n'est autorisée : le journal est immuable.

-- Un stagiaire relit son propre parcours (sur n'importe quel PC) à partir de
-- sa clé nom|prénom|type. Les fiches formateur (commentaires) ne sont pas exposées.
create or replace function public.ah_events_stagiaire(p_cle text)
returns setof public.ah_events
language sql stable security definer set search_path = public as $$
  select * from public.ah_events
  where (cle = p_cle and type in ('profil','tentative','decision'))
     or type = 'reglage'   -- règle de nouvelle tentative choisie par le formateur
  order by created_at, id;
$$;
revoke all on function public.ah_events_stagiaire(text) from public;
grant execute on function public.ah_events_stagiaire(text) to anon, authenticated;

grant usage on schema public to anon, authenticated;
grant insert on public.ah_events to anon;
grant select, insert, delete on public.ah_events to authenticated;
grant select on public.ah_admins to authenticated;

-- =====================================================================
-- APRÈS avoir créé votre compte formateur dans Authentication > Users
-- (bouton « Add user », e-mail + mot de passe, « Auto Confirm User »),
-- déclarez-le administrateur en remplaçant l'e-mail ci-dessous :
--
--   insert into public.ah_admins (user_id, email)
--   select id, email from auth.users where email = 'formateur@exemple.fr';
-- =====================================================================
