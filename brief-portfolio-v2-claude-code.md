# Portfolio ANASSE v2 : site animé et espace admin

Brief à donner à Claude Code. Rédigé le 28 octobre 2026.

## 1. Le contexte

Mon portfolio est aujourd'hui un seul fichier HTML statique, hébergé sur Vercel (https://portfolio-one-gilt-o8onabfb7f.vercel.app), code sur GitHub. Pour changer un texte, je dois toucher au code. Je veux le refaire en Next.js avec un espace admin où je change tout sans code : textes, projets, ordre des sections, sections masquées ou nouvelles, photos, couleurs et polices, en français et en anglais.

Deux exigences passent avant le reste : la fluidité du site et ses animations.

Méthode de travail :

1. Travaille sur une branche `v2`. Le site en ligne (`main`) ne bouge pas avant mon accord final.
2. Avance étape par étape (section 11). À chaque étape : dis ce que tu vas faire, fais-le, montre le résultat (aperçu Vercel de la branche ou capture), puis attends mon accord.
3. Si un point n'est pas clair, pose la question avant de coder.
4. Utilise les skills installées, en particulier UI/UX Pro Max pour le rendu.

## 2. Les maquettes à suivre

Toutes les maquettes sont validées. Elles sont sur le canevas Claude Design : https://claude.ai/artifact/JWa85B682HVD6yHz1AyMiJ (page « Site public » et page « Espace admin »).

Une copie des fichiers est jointe (`maquettes-portfolio.zip`). Décompresse-la à la racine du dépôt : elle crée le dossier `design/`.

| Fichier | Écran |
|---|---|
| `Main.dc.html` | Accueil, ordinateur |
| `Mobile.dc.html` | Accueil, téléphone (photo tout en haut) |
| `Login.dc.html` | Admin, connexion |
| `Dashboard.dc.html` | Admin, vue d'ensemble des sections |
| `Projects.dc.html` | Admin, une section ouverte (Projets) |
| `ProjectEdit.dc.html` | Admin, un élément ouvert (le projet Postula) |
| `Theme.dc.html` | Admin, couleurs et polices |
| `Media.dc.html` | Admin, photos |
| `canvas.json` | Disposition du canevas. La clé `notes` décrit chaque animation et chaque règle d'usage |

Les `.dc.html` sont écrits dans le format du canevas (trous `{{ }}`, balises `<sc-for>` et `<sc-if>`, classe `DCLogic`). Lis-les pour les couleurs, tailles, espacements, textes et durées d'animation exacts. Ne reprends pas ce format dans le code.

Dans l'admin, certains états sont montrés exprès : Parcours en cours de déplacement, O'Store en attente de confirmation de suppression, une couleur trop pâle, une description anglaise vide. Ce sont des exemples de comportement, pas des données.

## 3. Les outils

Vérifié le 28 octobre 2026 sur les sites officiels.

| Élément | Choix | Remarque |
|---|---|---|
| Framework | Next.js 16.4, App Router, TypeScript | Dernière version stable (sortie le 6 octobre 2026). Installe le dernier correctif : une mise à jour de sécurité est sortie le 14 octobre 2026 |
| Doc Next.js | `node_modules/next/dist/docs/` | Next.js livre sa doc dans le paquet. Lis-la avant d'utiliser le cache, elle correspond à ta version exacte |
| Style | Tailwind CSS | Couleurs et polices en variables CSS, lues depuis le thème publié |
| Base, connexion, photos | Supabase, plan gratuit | Paquets `@supabase/supabase-js` et `@supabase/ssr` |
| Animations | CSS pour les boucles, paquet `motion` (import `motion/react`) pour les révélations et la visionneuse | `AnimateNumber` de Motion est payant (Motion+) : le compteur se fait à la main |
| Icônes | `lucide-react` | Aucune autre bibliothèque d'icônes, aucun emoji |
| Glisser-déposer | dnd-kit | Admin seulement. Vérifie la version actuelle avant d'installer |
| Composants admin | shadcn/ui | Admin seulement |
| Hébergement | Vercel, plan Hobby | Inchangé |

Limites des plans gratuits, relevées sur les pages tarifs officielles :

| Service | Limite | Conséquence pour nous |
|---|---|---|
| Supabase Free | 500 Mo de base, 1 Go de fichiers, 50 Mo par fichier, 5 Go de sortie | Largement assez pour un portfolio |
| Supabase Free | Projet mis en pause après une semaine sans activité | Tâche planifiée quotidienne (section 9). Le site public ne dépend pas de Supabase pour s'afficher (section 4) |
| Supabase Free | Pas de sauvegarde automatique | Garder les 10 dernières versions publiées dans une table (section 8) |
| Supabase Free | Pas de transformation d'images | Compression dans le navigateur avant l'envoi (section 7) |
| Vercel Hobby, tâches planifiées | Une fois par jour au plus, heure exacte à 59 min près | Suffisant pour le réveil quotidien de Supabase |

## 4. Comment le site reste fluide

1. Les pages publiques sont pré-générées : `/` en français, `/en` en anglais. Un visiteur reçoit une page prête et ne touche jamais Supabase. Si Supabase est en pause, le site public reste affiché.
2. Le contenu publié est lu dans une fonction en cache (`'use cache'`, `cacheTag('site-content')`, `cacheLife('max')`), avec `cacheComponents: true` dans `next.config.ts`. Si tu juges l'ancien modèle de cache plus adapté, explique pourquoi avant de l'utiliser.
3. Publier appelle une Server Action qui copie le brouillon vers la version publiée puis appelle `updateTag('site-content')`. `updateTag` vide le cache tout de suite et ne marche que dans une Server Action. N'utilise pas `revalidateTag` avec un seul argument : cette forme est dépréciée.
4. Polices chargées avec `next/font`, hébergées sur le site : pas de saut de texte à l'affichage.
5. Images avec `next/image`, `sizes` renseigné, largeur et hauteur toujours connues. La photo du haut est prioritaire au chargement.
6. Les animations ne touchent que `transform` et `opacity`. Les boucles (grille Adinkra, halos, bande de noms) sont en CSS pur. Le JavaScript sert seulement au compteur, aux révélations au défilement et à la visionneuse photo.
7. Tout le code de l'admin (dnd-kit, shadcn/ui, formulaires) vit dans son propre groupe de routes. Rien n'en est chargé sur les pages publiques.
8. Si l'appareil demande « réduire les animations » (`prefers-reduced-motion`), tout s'affiche directement, compteurs compris.

Objectifs, mesurés avec PageSpeed Insights en mode téléphone : score de performance de 90 ou plus, LCP sous 2,5 s, CLS sous 0,1, INP sous 200 ms. Mesure après l'étape 3 et à la fin, et montre-moi les chiffres.

## 5. Le site public

L'ordre des sections ci-dessous est celui de départ. Il se change dans l'admin.

| Section | Contenu | Animations |
|---|---|---|
| Menu | Logo ANASSE, liens vers les sections, bouton FR/EN, bouton Me contacter. Sur téléphone, bouton menu à trois traits | Fixé en haut, fond indigo à 86 % avec flou derrière, ombre légère dès qu'on descend |
| Haut de page | Lieu, nom, « dit ANASSE », sous-titre, paragraphe, deux boutons, trois chiffres, photo (`moi-hero.webp`) | Voir le détail sous ce tableau |
| Bande de noms | GoCab Innovation Lab, INP-HB, Junior Entreprise ESCA, Belmor Cosmetic, sur fond ocre | Défilement continu, 30 s par tour (24 s sur téléphone), pause au survol sur ordinateur |
| À propos | Deux paragraphes et la carte « En bref » (6 lignes : icône, libellé, valeur) | Montée en fondu, la carte avec un léger décalage |
| Projets | Projet phare en grande carte sombre, puis grille de cartes. Statut coloré, étiquettes, liens | Cartes en cascade. Au survol : carte +4 px vers le haut, ombre plus grande, flèche +4 px à droite, capture à 105 % |
| Parcours | Frise de 5 étapes et la note « En parallèle » | La ligne ocre se dessine au défilement, chaque étape apparaît quand la ligne l'atteint. Titre collant à gauche sur ordinateur |
| Compétences | Trois cartes d'étiquettes | Cascade |
| Hors du cadre | Trois cartes avec image | Image à 105 % au survol |
| Galerie | Grille dense de 8 photos avec légende | Clic : visionneuse plein écran, fond sombre, flèches, clavier, glisser du doigt sur téléphone |
| Contact | Email avec bouton Copier, GitHub, LinkedIn, pied de page | Cartes en cascade. « Copier » affiche « Copié » pendant 2 s |

Détail du haut de page :

1. Grille de symboles Adinkra en fond : 14 colonnes sur 9 lignes de cases de 88 px sur ordinateur, 5 sur 6 de 78 px sur téléphone, avec un masque en dégradé qui laisse le texte lisible. Chaque symbole passe de l'opacité 0,1 à 0,95 puis revient, sur une durée tirée entre 2,6 et 5,2 s, avec un départ décalé entre 0 et 6 s. Les tirages sont fixes (graine), pour que la page soit identique à chaque affichage.
2. Deux halos ronds et flous, indigo et ocre, qui dérivent lentement : 19 s et 23 s par aller-retour.
3. Au chargement : le nom monte et apparaît (0,6 s), le trait ocre se dessine de gauche à droite (0,8 s, départ à 0,5 s), la photo apparaît avec un léger zoom arrière (0,9 s).
4. Compteurs : chaque chiffre a une option « compter » dans l'admin. Si elle est active, le nombre part de 0 et atteint sa valeur en 3 s, en ralentissant sur la fin (courbe cubique). Il démarre quand il entre à l'écran. Chiffres à largeur fixe (`tabular-nums`) pour éviter que la carte tremble. Un suffixe reste fixe (« /400 »). « D1 » ne compte pas.
5. Petit indicateur de défilement en bas.

Langues : le bouton FR/EN passe de `/` à `/en` par une navigation interne (composant `Link`), sans rechargement complet. Ajoute les balises `hreflang`.

Symboles Adinkra : les SVG des maquettes sont des versions simplifiées. Fais-en des composants SVG. Chaque section en porte un, choisi dans l'admin, avec sa signification en légende (Dwennimmen, Aya, Nkyinkyim, Mate Masie, Sankofa, Nkonsonkonson, Adinkrahene).

Contenu de départ : reprends le contenu du site actuel (`index.html` du dépôt) et ses 11 photos (`assets/img/`), avec ces corrections déjà faites dans les maquettes :

1. « première année » devient « deuxième année » du cycle ingénieur.
2. Le « stage d'immersion chez Gocab 225 » devient : « Chez GoCab Innovation Lab, je m'occupe du produit GoBuy : suivi financier, rapports de la semaine et coordination sur le terrain. »
3. Le projet Postula est ajouté (texte dans `Main.dc.html`).
4. Aucun tiret long ni demi-long dans les textes : remplace par une virgule, deux-points ou des parenthèses. Les périodes s'écrivent « 2021-2022 ».

Propose les traductions anglaises. Je les relirai dans l'admin.

## 6. L'espace admin

Adresse : `/admin`. Aucun lien depuis le site public, balise `noindex`.

Connexion :

1. Email et mot de passe Supabase. Un seul compte, le mien. Les inscriptions sont désactivées. Lien « Mot de passe oublié » géré par Supabase.
2. Un fichier `proxy.ts` à la racine rafraîchit la session (c'est le nom du fichier depuis Next.js 16, il s'appelait `middleware.ts` avant), comme le décrit la doc Supabase pour Next.js.
3. Chaque page admin et chaque Server Action vérifie la session avec `supabase.auth.getClaims()`, puis vérifie que l'email est celui de `ADMIN_EMAIL`. Jamais `getSession()` côté serveur : la doc Supabase dit de ne pas s'y fier.

Écrans (voir les maquettes) : vue d'ensemble, une page par section, une page par élément, apparence, photos. La barre du haut montre toujours le nombre de modifications non publiées, le bouton Aperçu et le bouton Publier.

Règles communes à tous les écrans :

1. Chaque texte a sa case français et sa case anglais, côte à côte. Une case anglaise vide : le site anglais affiche le français, l'admin montre un badge orange « À traduire ».
2. Tout ce qui porte la poignée à six points se déplace par glisser-déposer : sections, éléments, étapes, photos.
3. Toute suppression demande une confirmation.
4. Le brouillon s'enregistre seul, une seconde après la dernière frappe. Le bouton « Enregistrer le brouillon » reste là.
5. L'aperçu à droite suit la saisie en direct.
6. Validation de chaque enregistrement avec zod.

Ajouter une section : cinq formes au choix.

| Forme | Exemple déjà sur le site |
|---|---|
| Texte et photo | À propos |
| Cartes | Projets, Hors du cadre, Compétences |
| Frise de dates | Parcours |
| Galerie | Galerie |
| Liens | Contact |

Le haut de page et la bande de noms sont uniques : ils se modifient et se masquent, mais ne se dupliquent pas.

Projets : un seul projet phare à la fois (l'étoile). Le choisir retire l'étoile du précédent. Statuts disponibles : En cours, Refonte en cours, Livré, En vente, Aucun. Leur traduction anglaise est fixée dans le code.

Apparence :

1. Six couleurs : fond sombre, fond indigo, fond clair, accent, texte principal, texte secondaire. Valeurs de départ dans `Theme.dc.html`.
2. Pour chaque couleur de texte, calcule le contraste avec son fond (formule WCAG 2). Sous 4,5 pour 1, affiche l'alerte et demande une confirmation au moment de publier.
3. Deux polices : titres et texte. Liste courte préparée avec `next/font`, environ 8 choix pour les titres et 8 pour le texte. Propose-moi la liste. Départ : Bricolage Grotesque pour les titres, Inter pour le texte.
4. Bouton « Revenir au thème d'origine ».

Photos :

1. Envoi de plusieurs fichiers à la fois, en JPG, PNG ou WebP.
2. Compression dans le navigateur avant l'envoi : WebP, 2000 px au plus sur le grand côté.
3. Cadrage : libre, portrait 2:3, carré, paysage 16:9. Enregistré comme zone de recadrage, la photo d'origine reste intacte.
4. Légende et description pour les malvoyants, en français et en anglais.
5. « Utilisée dans » : liste des endroits où la photo apparaît. Une photo utilisée ne se supprime pas sans confirmation qui nomme ces endroits.

Brouillon, aperçu, publication :

1. Aperçu : une Server Action vérifie que je suis connecté, active le mode brouillon de Next.js (`draftMode().enable()`) et ouvre `/`. Quand ce mode est actif, les pages lisent le brouillon au lieu de la version publiée. Un bandeau « Aperçu du brouillon » s'affiche avec un bouton Quitter (`draftMode().disable()`, dans une Server Action).
2. Publier : copie du brouillon vers la version publiée, ajout d'une ligne dans les versions, puis `updateTag('site-content')`.
3. La liste « Pas encore publié » se calcule section par section, en comparant brouillon et version publiée. Chaque ligne a un bouton Annuler qui remet la section publiée dans le brouillon.

## 7. Les données dans Supabase

Tables :

| Table | Colonnes | Rôle |
|---|---|---|
| `site_content` | `key` (`draft` ou `published`, clé primaire), `content` jsonb, `updated_at` | Tout le site en un document JSON, en deux exemplaires |
| `site_versions` | `id`, `content` jsonb, `published_at` | Les 10 dernières versions publiées, les plus anciennes sont supprimées |
| `media` | `id`, `path`, `width`, `height`, `crop` jsonb, `caption` jsonb (fr, en), `alt` jsonb (fr, en), `created_at` | Les photos |

Stockage : un bucket `media`, lecture publique.

Sécurité (RLS active sur toutes les tables) :

1. Sans connexion : lecture de `site_content` où `key = 'published'`, et lecture de `media`. Rien d'autre.
2. Écriture, brouillon et versions : réservés à l'utilisateur dont `auth.jwt() ->> 'email'` vaut mon email.
3. Mêmes règles sur le bucket.
4. La clé secrète Supabase ne sort jamais du serveur ni du script d'import.

Forme du document JSON (à affiner avec moi à l'étape 1) :

```ts
type I18n = { fr: string; en: string }

type Content = {
  theme: {
    colors: { bgDark: string; bgIndigo: string; bgLight: string; accent: string; text: string; textMuted: string }
    fonts: { heading: string; body: string }
  }
  sections: Section[]
}

type Section = {
  id: string
  type: 'hero' | 'marquee' | 'text' | 'cards' | 'timeline' | 'gallery' | 'links'
  visible: boolean
  label: I18n        // « À propos », sert au menu
  title: I18n
  intro?: I18n
  symbol?: 'dwennimmen' | 'aya' | 'nkyinkyim' | 'mate-masie' | 'sankofa' | 'nkonsonkonson' | 'adinkrahene' | null
  data: unknown      // propre à chaque type, décrit par un schéma zod
}
```

Script d'import (`scripts/seed.ts`) : envoie les 11 photos de `assets/img/` dans le bucket, crée leurs lignes `media`, puis écrit le contenu de départ dans `draft` et `published`.

## 8. Variables d'environnement

| Nom | Contenu | Où |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Adresse du projet Supabase | `.env.local` et Vercel |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clé publishable | `.env.local` et Vercel |
| `SUPABASE_SECRET_KEY` | Clé secrète (pour le script d'import seulement) | `.env.local` seulement |
| `ADMIN_EMAIL` | rolandanasse5@gmail.com | `.env.local` et Vercel |
| `CRON_SECRET` | Chaîne aléatoire, 16 caractères ou plus | Vercel |

`.env.local` ne va jamais dans Git.

## 9. La tâche planifiée anti-pause

Dans `vercel.json`, une tâche par jour (le plan Hobby n'autorise pas plus) qui appelle `/api/keep-alive`. La route vérifie l'en-tête `Authorization: Bearer ${CRON_SECRET}` (Vercel l'envoie tout seul quand la variable existe), lit une ligne de `site_content` et répond. Rien d'autre.

La route ne doit jamais être mise en cache, sinon elle ne touche pas la base. `CRON_SECRET` fait au moins 16 caractères. Vercel ne garantit pas chaque exécution : un jour manqué n'est pas grave, la pause n'arrive qu'après une semaine sans activité.

## 10. Ce que je fais moi-même

Dis-moi au bon moment, avec les clics précis :

1. Créer le projet Supabase gratuit et te donner l'adresse et les clés.
2. Créer mon compte dans Supabase (Authentication, Add user) et désactiver les inscriptions.
3. Ajouter les variables dans Vercel.
4. Valider chaque étape.

## 11. Les étapes

1. Lecture : le dépôt actuel, les maquettes dans `design/`, la doc Next.js locale. Puis un plan détaillé, avec la forme du JSON et la liste des polices. Attends mon accord.
2. Base Next.js sur la branche `v2` : Tailwind, polices, couleurs en variables CSS, contenu de départ dans un fichier JSON local.
3. Site public complet avec toutes les animations, à partir de ce JSON. Aperçu Vercel et mesures PageSpeed.
4. Supabase : tables, règles RLS, bucket, script d'import.
5. Connexion et cadre de l'admin (menu de gauche, barre du haut).
6. Éditeurs : vue d'ensemble, sections, éléments, glisser-déposer, ajout et suppression.
7. Brouillon, aperçu, publication, versions.
8. Apparence.
9. Photos.
10. Anglais : `/en`, traductions proposées, badges « À traduire ».
11. Tâche planifiée et vérifications : un autre compte est refusé, aucune écriture possible sans connexion, alerte de contraste, mode « réduire les animations ».
12. Mesures finales, puis fusion dans `main` après mon accord.

## 12. À ne pas faire

1. Pas de lorem ipsum ni de chiffre inventé.
2. Pas de tiret long ni demi-long dans les textes du site.
3. Pas d'emoji.
4. Aucun lien public vers `/admin`.
5. Rien sur `main` avant mon accord final.
6. Pas de bibliothèque lourde sur les pages publiques (GSAP, Lottie, three.js) sans me demander.

## Sources vérifiées

1. Versions de Next.js : https://nextjs.org/blog
2. `revalidateTag` et sa forme à deux arguments : https://nextjs.org/docs/app/api-reference/functions/revalidateTag
3. `updateTag`, `revalidateTag`, `revalidatePath` : https://nextjs.org/docs/app/getting-started/revalidating
4. Mode brouillon : https://nextjs.org/docs/app/guides/draft-mode
5. Tâches planifiées Vercel, limites et sécurité : https://vercel.com/docs/cron-jobs/usage-and-pricing et https://vercel.com/docs/cron-jobs/manage-cron-jobs
6. Limites Supabase : https://supabase.com/pricing
7. Pause des projets Supabase gratuits : https://supabase.com/docs/guides/platform/free-project-pausing
8. Connexion Supabase avec Next.js : https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs
9. `useInView` de Motion : https://motion.dev/docs/react-use-in-view
10. `AnimateNumber` réservé à Motion+ : https://motion.dev/docs/react-animate-number
