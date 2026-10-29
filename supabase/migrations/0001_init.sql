-- Portfolio ANASSE v2 : tables, règles d'accès (RLS), stockage des photos et publication.
-- À lancer une seule fois : Supabase, SQL Editor, New query, coller ce fichier, Run.
-- Tout se fait dans une seule transaction : soit tout passe, soit rien n'est créé.

begin;

-- 1. L'admin
-- Le seul compte qui peut écrire. Même adresse que ADMIN_EMAIL (.env.local et Vercel) :
-- si elle change un jour, il faut changer les deux.
create function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(lower(auth.jwt() ->> 'email') = 'rolandanasse5@gmail.com', false)
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;


-- 2. Les tables

-- Tout le site en un document JSON, en deux exemplaires : le brouillon et la version publiée.
create table public.site_content (
  key text primary key check (key in ('draft', 'published')),
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  updated_at timestamptz not null default now()
);

-- Les 10 dernières versions publiées (le plan gratuit n'a pas de sauvegarde automatique).
create table public.site_versions (
  id bigint generated always as identity primary key,
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  published_at timestamptz not null default now()
);

-- Les photos. Le fichier est dans le bucket media, sous un nom unique (path).
-- Mêmes règles que lib/content/schema.ts pour l'identifiant et le chemin.
create table public.media (
  id text primary key default gen_random_uuid()::text check (id ~ '^[a-z0-9][a-z0-9-]{0,63}$'),
  path text not null unique check (path ~ '^[a-z0-9][a-z0-9/._-]{0,200}\.webp$'),
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  crop jsonb,
  caption jsonb not null default '{"fr": "", "en": ""}',
  alt jsonb not null default '{"fr": "", "en": ""}',
  created_at timestamptz not null default now()
);

-- La date du brouillon change à chaque enregistrement : l'admin s'en sert pour ne pas écraser
-- un enregistrement fait entre-temps dans un autre onglet.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end
$$;

create trigger site_content_set_updated_at
before update on public.site_content
for each row execute function public.set_updated_at();


-- 3. Droits de base. On part de zéro, puis on n'ouvre que le nécessaire.
-- Les règles RLS (partie 4) filtrent ensuite ligne par ligne.
revoke all on public.site_content, public.site_versions, public.media from anon, authenticated;

grant select on public.site_content, public.media to anon;
grant select, insert, update on public.site_content to authenticated;
grant select, insert, delete on public.site_versions to authenticated;
grant select, insert, update, delete on public.media to authenticated;

-- La clé secrète (script d'import seulement) passe outre les règles RLS.
grant all on public.site_content, public.site_versions, public.media to service_role;


-- 4. Règles RLS
alter table public.site_content enable row level security;
alter table public.site_versions enable row level security;
alter table public.media enable row level security;

-- Sans connexion : la version publiée seulement, jamais le brouillon.
create policy "Visiteur : lit la version publiée"
on public.site_content for select to anon
using (key = 'published');

create policy "Connecté : version publiée, brouillon pour l'admin"
on public.site_content for select to authenticated
using (key = 'published' or (select public.is_admin()));

create policy "Admin : crée le contenu"
on public.site_content for insert to authenticated
with check ((select public.is_admin()));

create policy "Admin : modifie le contenu"
on public.site_content for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Admin : lit les versions"
on public.site_versions for select to authenticated
using ((select public.is_admin()));

create policy "Admin : ajoute une version"
on public.site_versions for insert to authenticated
with check ((select public.is_admin()));

create policy "Admin : supprime une version"
on public.site_versions for delete to authenticated
using ((select public.is_admin()));

create policy "Tout le monde : lit les photos"
on public.media for select to anon, authenticated
using (true);

create policy "Admin : ajoute une photo"
on public.media for insert to authenticated
with check ((select public.is_admin()));

create policy "Admin : modifie une photo"
on public.media for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Admin : supprime une photo"
on public.media for delete to authenticated
using ((select public.is_admin()));


-- 5. Stockage des photos
-- Bucket public : chaque photo se lit par son adresse, mais personne ne peut lister le bucket.
-- WebP seulement (l'admin compresse dans le navigateur avant l'envoi), 10 Mo au plus.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760, array['image/webp']);

create policy "Photos : l'admin lit"
on storage.objects for select to authenticated
using (bucket_id = 'media' and (select public.is_admin()));

create policy "Photos : l'admin envoie"
on storage.objects for insert to authenticated
with check (bucket_id = 'media' and (select public.is_admin()));

create policy "Photos : l'admin remplace"
on storage.objects for update to authenticated
using (bucket_id = 'media' and (select public.is_admin()))
with check (bucket_id = 'media' and (select public.is_admin()));

create policy "Photos : l'admin supprime"
on storage.objects for delete to authenticated
using (bucket_id = 'media' and (select public.is_admin()));


-- 6. Publication en une seule opération
-- L'admin valide le brouillon, y ajoute la copie des photos utilisées, puis appelle cette fonction.
-- p_draft_updated_at : la date du brouillon validé, telle que lue en base (texte brut, sans passer
-- par un Date JavaScript qui perdrait les microsecondes). Si le brouillon a changé entre-temps,
-- rien n'est publié.
-- Elle s'exécute avec les droits de l'admin connecté : les règles RLS s'appliquent aussi ici.
create function public.publish_site(p_content jsonb, p_draft_updated_at timestamptz)
returns timestamptz
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_published_at timestamptz := now();
begin
  if not (select public.is_admin()) then
    raise exception 'Publication réservée à l''admin' using errcode = '42501';
  end if;

  perform 1 from public.site_content
  where key = 'draft' and updated_at = p_draft_updated_at
  for update;
  if not found then
    raise exception 'Le brouillon a changé depuis sa lecture' using errcode = 'P0001', hint = 'draft_changed';
  end if;

  insert into public.site_content (key, content, updated_at)
  values ('published', p_content, v_published_at)
  on conflict (key) do update set content = excluded.content;

  insert into public.site_versions (content, published_at)
  values (p_content, v_published_at);

  delete from public.site_versions
  where id not in (
    select id from public.site_versions order by published_at desc, id desc limit 10
  );

  return v_published_at;
end
$$;

revoke execute on function public.publish_site(jsonb, timestamptz) from public, anon;
grant execute on function public.publish_site(jsonb, timestamptz) to authenticated;

commit;
