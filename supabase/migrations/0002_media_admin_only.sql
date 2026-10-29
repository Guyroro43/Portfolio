-- Les photos envoyées mais pas encore publiées restent privées : seul l'admin lit la table media.
-- Le site public n'en a pas besoin, la version publiée contient déjà la copie de ses photos.
-- Écart au brief validé par Anassé le 29 octobre 2026.
-- À lancer une seule fois : Supabase, SQL Editor, New query, coller ce fichier, Run.

begin;

drop policy "Tout le monde : lit les photos" on public.media;
revoke select on public.media from anon;

create policy "Admin : lit les photos"
on public.media for select to authenticated
using ((select public.is_admin()));

commit;
