# Portfolio — Guy Roland Obodjé (ANASSE)

Site portfolio personnel, statique (HTML/CSS/JS, sans build), identité éditoriale noir/blanc + accent vermillon.

## Structure

```
portfolio-anasse/
├── index.html
├── css/style.css
├── js/script.js
├── assets/img/       ← photos optimisées (WebP) utilisées par le site
└── media/            ← photos sources brutes (non versionnées, voir .gitignore)
```

## Photos

Les photos sources dans `media/` sont redimensionnées et converties en WebP dans
`assets/img/` (script Python + Pillow) pour réduire le poids des pages :
originaux de 100 Ko à 760 Ko ramenés à 25–200 Ko selon l'usage. `media/` est
ignoré par git — seules les versions optimisées de `assets/img/` sont
déployées.

## Développement local

Aucune installation requise. Ouvre simplement `index.html` dans un navigateur,
ou sers le dossier avec un petit serveur local (recommandé pour un rendu fidèle) :

```bash
npx serve .
```

## Déploiement

### GitHub Pages

1. Pousse ce dossier sur un dépôt GitHub (à la racine, ou dans un sous-dossier avec ajustement des chemins).
2. Dans les paramètres du dépôt : **Settings → Pages → Source**, sélectionne la branche (ex. `main`) et le dossier `/ (root)`.
3. Le site sera disponible à `https://<ton-user>.github.io/<nom-du-repo>/`.

### Vercel

1. Importe le dépôt sur [vercel.com/new](https://vercel.com/new).
2. Framework preset : **Other** (aucun build nécessaire).
3. Laisse "Build command" et "Output directory" vides, ou mets `.` comme output directory.
4. Déploie — le site est servi directement.
