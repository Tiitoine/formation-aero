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
drop policy if exists ah_events_admin_update  on public.ah_events;
drop policy if exists ah_events_admin_delete  on public.ah_events;
drop policy if exists ah_admins_self          on public.ah_admins;

-- Stagiaires (clé anon publique) : INSERT de 'profil' ou 'tentative' UNIQUEMENT.
-- Interdits : 'decision', 'fiche', 'suppression', 'reglage' (réservés aux admins).
-- Cohérence imposée : l'identité déclarée dans le payload = colonnes cle / student_id,
-- identifiant d'événement conforme, payload < 65 000 octets.
create policy ah_events_insert_anon on public.ah_events
  for insert to anon, authenticated
  with check (
    type in ('profil','tentative')
    and octet_length(payload::text) < 65000
    and student_id is not null
    and student_id = payload->'who'->>'id'
    and cle = payload->'who'->>'cle'
    and (
      (type = 'profil'    and id = 'p_' || student_id)
      or (type = 'tentative' and id = 't_' || (payload->'entry'->>'id') and jsonb_typeof(payload->'entry') = 'object')
    )
  );

-- Administrateurs (comptes Supabase Auth listés dans ah_admins) : SELECT, INSERT, UPDATE, DELETE
create policy ah_events_admin_select on public.ah_events
  for select to authenticated using (public.ah_is_admin());
create policy ah_events_admin_insert on public.ah_events
  for insert to authenticated with check (public.ah_is_admin() and octet_length(payload::text) < 1000000);
create policy ah_events_admin_update on public.ah_events
  for update to authenticated using (public.ah_is_admin()) with check (public.ah_is_admin());
create policy ah_events_admin_delete on public.ah_events
  for delete to authenticated using (public.ah_is_admin());

create policy ah_admins_self on public.ah_admins
  for select to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- TRIGGER D'INTÉGRITÉ (exécuté par le serveur, impossible à contourner
-- depuis le navigateur) :
--   * horodatage serveur : created_at = now() (la date client est ignorée) ;
--   * tentative avec détail des réponses : good / total / score / statut
--     sont RECALCULÉS à partir des réponses (un score falsifié est écrasé).
--     Exception : le simulateur M4B (« simulateur-final »), dont la liste ne
--     contient que les erreurs : score simplement borné entre 0 et 100.
-- ---------------------------------------------------------------------
create or replace function public.ah_events_integrite() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_ans   jsonb;
  v_good  int;
  v_total int;
  v_score numeric;
begin
  new.created_at := now();
  if new.type = 'tentative' and jsonb_typeof(new.payload->'entry') = 'object' then
    v_ans := new.payload->'entry'->'answers';
    if coalesce(new.payload->'entry'->>'atelierId', '') = 'simulateur-final' then
      if jsonb_typeof(new.payload->'entry'->'score') = 'number' then
        v_score := least(100, greatest(0, (new.payload->'entry'->>'score')::numeric));
        new.payload := jsonb_set(new.payload, '{entry,score}', to_jsonb(v_score));
        new.payload := jsonb_set(new.payload, '{entry,statut}', to_jsonb(case when v_score >= 85 then 'VALIDE' else 'À REVOIR' end));
      end if;
    elsif jsonb_typeof(v_ans) = 'array' and jsonb_array_length(v_ans) > 0 then
      select count(*) filter (where coalesce((a->>'ok')::boolean, false)) into v_good from jsonb_array_elements(v_ans) a;
      v_total := greatest(jsonb_array_length(v_ans),
                          case when jsonb_typeof(new.payload->'entry'->'total') = 'number' then (new.payload->'entry'->>'total')::int else 0 end);
      v_score := round(floor(v_good * 1000.0 / v_total) / 10, 1);
      new.payload := jsonb_set(new.payload, '{entry,good}',  to_jsonb(v_good));
      new.payload := jsonb_set(new.payload, '{entry,total}', to_jsonb(v_total));
      new.payload := jsonb_set(new.payload, '{entry,score}', to_jsonb(v_score));
      new.payload := jsonb_set(new.payload, '{entry,statut}', to_jsonb(case when v_score >= 85 then 'VALIDE' else 'À REVOIR' end));
    end if;
  end if;
  return new;
end $$;

drop trigger if exists ah_events_integrite on public.ah_events;
create trigger ah_events_integrite before insert on public.ah_events
  for each row execute function public.ah_events_integrite();

-- Journal immuable : toute modification (UPDATE) par un non-admin est refusée,
-- même si un droit était accordé par erreur plus tard.
create or replace function public.ah_events_no_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not public.ah_is_admin() then
    raise exception 'ah_events : modification interdite (journal immuable, réservé aux administrateurs)';
  end if;
  new.created_at := old.created_at;
  return new;
end $$;

drop trigger if exists ah_events_no_update on public.ah_events;
create trigger ah_events_no_update before update on public.ah_events
  for each row execute function public.ah_events_no_update();

-- ---------------------------------------------------------------------
-- ENVOI STAGIAIRE : PostgreSQL refuse « INSERT … ON CONFLICT DO NOTHING »
-- au rôle anon tant qu'il ne peut pas LIRE la table (et il ne doit pas la lire).
-- Le site passe donc par cette fonction, qui applique EXACTEMENT les mêmes
-- contrôles que la règle ah_events_insert_anon, ignore les doublons, et
-- déclenche le trigger d'intégrité (score recalculé, horodatage serveur).
-- ---------------------------------------------------------------------
create or replace function public.ah_push_stagiaire(p_events jsonb)
returns integer
language plpgsql security definer set search_path = public as $$
declare
  e jsonb;
  n integer := 0;
  k integer;
begin
  if jsonb_typeof(p_events) <> 'array' or jsonb_array_length(p_events) > 500 then
    raise exception 'ah_push_stagiaire : tableau de 500 événements maximum attendu';
  end if;
  for e in select * from jsonb_array_elements(p_events) loop
    if not (
      e->>'type' in ('profil','tentative')
      and jsonb_typeof(e->'payload') = 'object'
      and octet_length((e->'payload')::text) < 65000
      and coalesce(e->>'student_id','') <> ''
      and e->>'student_id' = e->'payload'->'who'->>'id'
      and e->>'cle' = e->'payload'->'who'->>'cle'
      and ( (e->>'type' = 'profil' and e->>'id' = 'p_' || (e->>'student_id'))
         or (e->>'type' = 'tentative' and jsonb_typeof(e->'payload'->'entry') = 'object'
             and e->>'id' = 't_' || (e->'payload'->'entry'->>'id')) )
    ) then
      raise exception 'ah_push_stagiaire : événement refusé (type interdit ou identité incohérente) : %', left(coalesce(e->>'id','?'), 80);
    end if;
    insert into public.ah_events (id, type, cle, student_id, payload)
    values (e->>'id', e->>'type', e->>'cle', e->>'student_id', e->'payload')
    on conflict (id) do nothing;
    get diagnostics k = row_count;
    n := n + k;
  end loop;
  return n;
end $$;
revoke all on function public.ah_push_stagiaire(jsonb) from public;
grant execute on function public.ah_push_stagiaire(jsonb) to anon, authenticated;

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
revoke all on public.ah_events from anon;
grant insert on public.ah_events to anon;                         -- anon : INSERT seul (ni UPDATE, ni DELETE)

grant select, insert, update, delete on public.ah_events to authenticated;   -- filtré par les règles admin ci-dessus
revoke all on public.ah_admins from anon;
grant select on public.ah_admins to authenticated;

-- =====================================================================
-- APRÈS avoir créé votre compte formateur dans Authentication > Users
-- (bouton « Add user », e-mail + mot de passe, « Auto Confirm User »),
-- déclarez-le administrateur en remplaçant l'e-mail ci-dessous :
--
--   insert into public.ah_admins (user_id, email)
--   select id, email from auth.users where email = 'formateur@exemple.fr';
-- =====================================================================
