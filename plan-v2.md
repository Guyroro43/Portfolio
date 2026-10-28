# Plan détaillé : Portfolio ANASSE v2

Étape 1 du brief. Rédigé le 28 octobre 2026, après lecture du dépôt, des 8 maquettes, de `canvas.json` et de la doc locale de Next.js 16.4.3.

## 1. Décisions à valider

Ces points s'écartent du brief ou demandent ton avis. Le reste du plan suit le brief.

| # | Sujet | Ma proposition | Pourquoi |
|---|---|---|---|
| A | Révélations au défilement | CSS + un petit script natif (IntersectionObserver, moins de 1 Ko) au lieu de Motion. Motion sert seulement à la visionneuse photo, chargé au premier clic sur une photo | Motion pèse environ 30 Ko de JavaScript sur chaque visite. Sans lui, le score PageSpeed et l'INP sont meilleurs. Le rendu à l'écran est le même |
| B | Photos et pause Supabase | Les photos sont servies par Supabase. Chaque envoi reçoit un nom de fichier unique, et Vercel garde les images optimisées en cache un an (`minimumCacheTTL`) | Le texte du site reste en ligne si Supabase dort, mais une photo jamais vue par Vercel ne s'afficherait pas. Le cache long et la tâche anti-pause couvrent ce cas |
| C | Chiffre « 25 camarades de promo formés à Excel » | À confirmer | Il est dans la maquette mais pas sur le site actuel. Le brief interdit les chiffres inventés |
| D | Glisser-déposer | `@dnd-kit/core` 6.3 et `@dnd-kit/sortable` 10 (version classique, stable) | La nouvelle version `@dnd-kit/react` est encore en 0.5, son API peut changer |
| E | Fond de chaque section | Un choix parmi 4 tons : sombre, indigo, clair, clair alterné | La maquette utilise un 4e fond (`#EFEAE0`, Hors du cadre), calculé à partir du fond clair. Une nouvelle section a besoin d'un fond |
| F | Images manquantes | Sans image, la carte affiche un bloc indigo avec son icône, sans texte « à ajouter » | Pas de capture d'ANTA dans le dépôt, et l'image eFootball viendra plus tard. La vidéo `efootball.mp4` n'est pas reprise |
| G | Polices | Liste en section 6 | Le brief demande de te la proposer |

## 2. Architecture

| Élément | Choix |
|---|---|
| Versions | Next.js 16.4.3 (installé), React 19.3, Tailwind 4.3, Motion 14.7, lucide-react 1.63, zod 4.6, `@supabase/supabase-js` 2.118, `@supabase/ssr` 0.12, shadcn 4.23, react-easy-crop 6.2 (cadrage, admin seulement) |
| Config | `cacheComponents: true` et `partialPrefetching: true` dans `next.config.ts`. La doc 16.4 demande les deux, sinon un avertissement s'affiche |
| Pages publiques | `app/[lang]/page.tsx`, avec `generateStaticParams` qui renvoie `fr` et `en`, et `ensureStatic = 'navigation'` pour que la page reste entièrement pré-générée. `/` est réécrit vers `/fr` dans `next.config.ts` (`rewrites`), et `/fr` redirige vers `/` |
| Langue | Un seul layout racine pour `/` et `/en` (`app/[lang]/layout.tsx`, `<html lang>` juste). Le bouton FR/EN est un `Link` : changement sans rechargement complet. Balises `hreflang` (`fr`, `en`, `x-default`) |
| Admin | `app/admin/` avec son propre layout racine. Rien de l'admin n'est chargé sur le site public. `noindex` en balise et en en-tête HTTP. Pas de ligne `/admin` dans `robots.txt` : elle révélerait l'adresse |
| `proxy.ts` | Limité à `/admin/:path*`. Le site public ne passe jamais par lui, donc aucun délai ajouté pour les visiteurs |
| Lecture du contenu | `getContent()` avec `'use cache'`, `cacheTag('site-content')`, `cacheLife('max')`. Je garde ce modèle : la doc confirme qu'il convient. Avec `max`, un rafraîchissement en arrière-plan a lieu au plus tous les 30 jours. S'il échoue (Supabase en pause), l'ancienne page reste servie |
| Mode brouillon | `getContent()` lit `draftMode().isEnabled` (autorisé dans `'use cache'` d'après la doc) et choisit la ligne `draft` ou `published`. Les visiteurs ne sont pas concernés |
| Vercel | Un `vercel.json` sur `v2` force le type de projet Next.js pour cette branche. Le site actuel sur `main` reste un site statique tant qu'on n'a pas fusionné |

## 3. Forme du document JSON

Une seule règle pour les langues : chaque texte a `fr` et `en`. Une case `en` vide affiche le français sur `/en`, avec le badge « À traduire » dans l'admin. Le contenu de départ remplit déjà toutes les cases anglaises. Seuls ton nom, les adresses et les liens n'ont qu'une case.

```ts
type I18n = { fr: string; en: string }
type MediaId = string            // id d'une ligne de la table media

type Content = {
  site: {
    meta: { title: I18n; description: I18n }   // onglet, Google, partages
    contactButton: I18n                          // « Me contacter » dans le menu
    footer: { left: I18n; right: I18n }
  }
  theme: {
    colors: { bgDark: string; bgIndigo: string; bgLight: string; accent: string; text: string; textMuted: string }
    fonts: { heading: HeadingFont; body: BodyFont }   // noms pris dans la liste de la section 6
  }
  sections: Section[]            // l'ordre du tableau est l'ordre sur la page
  // ajouté seulement dans la version publiée, voir section 4
  media?: Record<MediaId, { path: string; width: number; height: number; crop: Crop | null; caption: I18n; alt: I18n }>
}

type Section = {
  id: string
  type: 'hero' | 'marquee' | 'text' | 'cards' | 'timeline' | 'gallery' | 'links'
  visible: boolean
  inMenu: boolean                // lien dans le menu du haut
  label: I18n                    // menu et surtitre « 01 · À propos » (numéro calculé selon l'ordre)
  title: I18n                    // grand titre : « Qui je suis »
  intro: I18n                    // phrase sous le titre, peut rester vide
  symbol: AdinkraSymbol | null   // signification FR et EN fixée dans le code
  tone: 'dark' | 'indigo' | 'light' | 'light-alt'
  data: HeroData | MarqueeData | TextData | CardsData | TimelineData | GalleryData | LinksData
}

type HeroData = {
  location: I18n
  name: string                               // « Guy Roland Obodjé »
  nickname: { prefix: I18n; name: string }   // « dit » / « aka », « ANASSE »
  role: I18n
  lead: I18n
  buttons: { id: string; label: I18n; target: string }[]   // id d'une section, 2 au plus
  stats: { id: string; value: string; suffix: string; count: boolean; label: I18n }[]   // « 330 » + « /400 », compter : oui
  photo: MediaId | null
}

type MarqueeData = { items: { id: string; text: I18n }[] }

type TextData = {
  paragraphs: { id: string; text: I18n }[]
  side:
    | { kind: 'card'; title: I18n; rows: { id: string; icon: IconName; label: I18n; value: I18n }[] }   // « En bref »
    | { kind: 'photo'; photo: MediaId }
    | null
}

type CardsData = {
  variant: 'projects' | 'tags' | 'pictures'   // Projets, Compétences, Hors du cadre
  items: {
    id: string
    icon: IconName | null
    kicker: I18n                 // petit libellé « eFootball » (variante pictures)
    title: I18n
    text: I18n
    tags: { id: string; text: I18n }[]
    status: 'in-progress' | 'redesign' | 'delivered' | 'for-sale' | null   // traduction fixée dans le code
    featured: boolean            // un seul à true par section (l'étoile)
    siteUrl: string
    codeUrl: string
    image: MediaId | null        // capture ou image de la carte
  }[]
}

type TimelineData = {
  steps: { id: string; date: I18n; title: I18n; text: I18n }[]   // la dernière étape est mise en avant
  note: { label: I18n; text: I18n } | null                        // « En parallèle : ... »
}

type GalleryData = { items: { id: string; photo: MediaId; tall: boolean }[] }   // tall : occupe 2 rangées

type LinksData = {
  items: { id: string; kind: 'email' | 'github' | 'linkedin' | 'link'; label: I18n; display: string; href: string }[]
}   // kind 'email' ajoute le bouton Copier

type Crop = { aspect: 'free' | '2:3' | '1:1' | '16:9'; x: number; y: number; width: number; height: number }   // en % de l'original
```

`IconName` : une liste courte d'icônes lucide (une vingtaine) choisies dans l'admin, par exemple GraduationCap, Users, Briefcase, Trophy, ShoppingBag, MapPin, FileText, Gamepad2, BookOpen, TrendingUp, Database, Code, Clapperboard, Mail. lucide n'a plus d'icônes de marques : GitHub et LinkedIn gardent les icônes de la maquette (Code et Briefcase).

Chaque type a son schéma zod. Le haut de page et la bande de noms sont uniques : le schéma refuse un deuxième exemplaire.

## 4. Supabase

Tables, bucket et règles RLS comme dans le brief. Trois ajouts :

1. **Publication en une seule opération.** Une fonction Postgres `publish_site()` copie le brouillon vers `published`, ajoute la ligne dans `site_versions` et supprime les versions au-delà de 10, le tout dans une transaction. Si une étape échoue, rien n'est publié à moitié. La Server Action vérifie la session, appelle cette fonction, puis `updateTag('site-content')`.
2. **Photos copiées dans la version publiée.** À la publication, les infos des photos utilisées (chemin, taille, cadrage, légende, description) sont recopiées dans le document publié. Le site public lit une seule ligne. Une légende modifiée passe en ligne à la publication suivante, comme le reste, et apparaît dans « Pas encore publié ».
3. **Brouillon protégé contre l'écrasement.** Chaque enregistrement envoie la date du brouillon lu. Si un autre onglet a enregistré entre-temps, l'admin te prévient au lieu d'écraser.

Les envois de photos partent directement du navigateur vers le bucket, avec ta session (règles RLS du bucket). La clé secrète ne sert qu'au script d'import.

## 5. Animations

| Élément | Technique |
|---|---|
| Grille Adinkra, halos, bande de noms, indicateur de défilement | CSS pur. Les 4 symboles de la grille sont définis une fois (`<symbol>`), chaque case les réutilise : HTML plus léger. Tirages fixes (même formule de graine que la maquette) |
| Nom, trait ocre, photo au chargement | CSS pur, durées de la maquette (0,6 s, 0,8 s à 0,5 s, 0,9 s). Téléphone : 0,5 s, 0,7 s, 0,8 s |
| Compteurs | Petit composant client : départ quand le chiffre entre à l'écran, 3 s, courbe cubique, `tabular-nums`. Le HTML contient la valeur finale, lisible sans JavaScript et par Google |
| Révélations (montée en fondu, cascades) | Classes CSS + IntersectionObserver natif (décision A). Décalages de la maquette |
| Frise du Parcours | La ligne suit le défilement (`transform: scaleY`, mis à jour à chaque image). Chaque étape apparaît quand la ligne l'atteint. Titre collant sur ordinateur |
| Survols | CSS pur (+4 px, ombre, flèche +4 px, image à 105 %). Désactivés sur écran tactile |
| Visionneuse | Motion, chargé au premier clic. Fond sombre, flèches, clavier (Échap, gauche, droite), glisser du doigt |
| Réduire les animations | Tout s'affiche directement, compteurs à leur valeur finale |

Seuls `transform` et `opacity` sont animés.

## 6. Polices

Toutes sont variables (un seul fichier par police), hébergées sur le site par `next/font`, sous-ensembles `latin` et `latin-ext`. Le visiteur ne télécharge que les 2 polices actives.

| Titres | Style | Texte | Style |
|---|---|---|---|
| **Bricolage Grotesque** (départ) | Grotesque expressive, celle de la maquette | **Inter** (départ) | Neutre, très lisible |
| Sora | Géométrique, nette | DM Sans | Géométrique douce |
| Space Grotesk | Technique, un peu rétro | Manrope | Moderne, arrondie |
| Fraunces | Serif à caractère, éditoriale | Work Sans | Simple, chaleureuse |
| Syne | Large et audacieuse | Plus Jakarta Sans | Élégante, aérée |
| Outfit | Géométrique ronde | Figtree | Amicale, très lisible petit |
| Unbounded | Très large, forte présence | IBM Plex Sans | Sérieuse, un peu technique |
| Archivo | Grotesque solide, compacte | Source Sans 3 | Classique, longue lecture |

Les 4 premières de chaque colonne sont celles de la maquette Apparence.

## 7. Contraste des couleurs

Formule WCAG 2, vérifiée sur les valeurs de départ (la couleur pâle de la maquette donne bien 2,4 pour 1). Paires contrôlées :

| Texte | Fond | Départ |
|---|---|---|
| Texte principal | Fond clair | 15,3 |
| Texte secondaire | Fond clair | 7,0 |
| Fond clair (texte des sections foncées) | Fond sombre, fond indigo | 17,0 et 15,3 |
| Fond sombre (texte des boutons) | Accent | 8,5 |
| Accent (surtitres sur fond foncé) | Fond sombre, fond indigo | 8,5 et 7,7 |
| Ocre foncé des surtitres (calculé depuis l'accent) | Fond clair | 5,3 |

Les autres teintes de la maquette (bordures, fonds d'étiquettes, textes pâles sur fond foncé) sont calculées à partir des 6 couleurs avec `color-mix()`. Changer une couleur met donc tout le site à jour. Sous 4,5 pour 1 : alerte, et confirmation demandée au moment de publier.

## 8. Admin

Pages : `/admin/login`, `/admin` (vue d'ensemble), `/admin/sections/[id]`, `/admin/sections/[id]/[itemId]`, `/admin/apparence`, `/admin/photos`.

1. Chaque page et chaque Server Action appelle une même fonction `requireAdmin()` : `getClaims()`, puis comparaison avec `ADMIN_EMAIL`. Le proxy ne sert qu'à rafraîchir la session, il ne fait pas office de contrôle.
2. L'aperçu à droite réutilise les vrais composants du site public. Ce que tu vois est ce que les visiteurs verront.
3. Formulaires : état React simple et zod, sans bibliothèque de formulaires. Enregistrement automatique 1 s après la dernière frappe.
4. Compression des photos dans le navigateur avec les outils natifs (canvas vers WebP, 2000 px au plus), sans bibliothèque.
5. « Pas encore publié » : comparaison section par section, plus le thème et l'ordre des sections. « Annuler » remet la version publiée dans le brouillon (une section ajoutée est retirée, une section supprimée revient à sa place).
6. Connexion : Supabase limite déjà les tentatives. Le lien « Mot de passe oublié » renvoie vers une page `/admin/nouveau-mot-de-passe`.

## 9. Dépôt sur la branche `v2`

1. L'ancien site (`index.html`, `css/`, `js/`, `admin/`, la vidéo) est retiré de `v2`. Il reste intact sur `main` et dans l'historique Git.
2. Les 11 photos passent dans `public/images/` pour les étapes 2 et 3. À l'étape 4, le script d'import les envoie dans Supabase et le site les lit depuis là.
3. `brief-portfolio-v2-claude-code.md`, `plan-v2.md` et `design/` restent dans le dépôt comme référence.

## 10. Étapes, avec ce que je te montre

| # | Étape | Ce que je te montre | Ce que tu fais |
|---|---|---|---|
| 1 | Lecture et plan | Ce fichier | Valider les points A à G |
| 2 | Base Next.js, Tailwind, polices, couleurs en variables, `content/seed.json` | Capture de la page vide avec thème et polices | Valider |
| 3 | Site public complet, FR seulement, toutes les animations | Aperçu Vercel de `v2` (je pousse la branche), chiffres PageSpeed téléphone | Valider |
| 4 | Supabase : tables, RLS, bucket, `publish_site()`, `scripts/seed.ts` | Les tables remplies, le site qui lit Supabase | Créer le projet Supabase et me donner l'adresse et les clés (je te donne les clics) |
| 5 | Connexion, menu de gauche, barre du haut | Captures de la connexion et du cadre | Créer ton compte, couper les inscriptions |
| 6 | Éditeurs, glisser-déposer, ajout et suppression | Démonstration sur l'aperçu | Valider |
| 7 | Brouillon, aperçu, publication, versions | Une modification publiée de bout en bout | Valider |
| 8 | Apparence | Changement de couleur et de police, alerte de contraste | Valider |
| 9 | Photos | Envoi, compression, cadrage, « Utilisée dans » | Valider |
| 10 | Anglais : `/en`, traductions, badges | `/en` complet | Relire les traductions dans l'admin |
| 11 | Tâche anti-pause et vérifications | Résultat de chaque test (autre compte refusé, écriture sans connexion refusée, contraste, réduire les animations) | Ajouter les variables dans Vercel |
| 12 | Mesures finales | Chiffres PageSpeed | Accord final, puis fusion dans `main` |

Tâche anti-pause : une fois par jour vers 6 h 07 (heure d'Abidjan), jamais à l'heure pile. La route `/api/keep-alive` lit l'en-tête `Authorization` : la doc confirme qu'elle n'est alors jamais mise en cache.

Avant chaque commit important : `/security-review`.
