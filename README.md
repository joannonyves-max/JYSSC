# Jyssc — site vitrine

Site vitrine de l'auto-entreprise **Jyssc** : développement, conception et maintenance de
logiciels et d'applications informatiques.

Site 100 % statique (HTML / CSS / JavaScript), **sans dépendance ni build**.
Il s'ouvre directement en double-cliquant sur `index.html` et s'héberge n'importe où.

## Structure

```
index.html              Page unique : accueil, services, réalisations, méthode, à propos, contact
mentions-legales.html   Mentions légales + RGPD (obligatoire)
robots.txt / sitemap.xml  Référencement
assets/css/style.css    Tout le design
assets/js/projects.js   >>> LE CATALOGUE DE VOS APPLICATIONS <<<
assets/js/main.js       Menu, animations, formulaire de contact
assets/img/favicon.svg  Icône de l'onglet
```

## Ajouter une nouvelle application

Ouvrez `assets/js/projects.js`, copiez un bloc `{ ... }`, collez-le et modifiez les valeurs.
C'est le seul fichier à toucher — la section « Réalisations » se met à jour toute seule.

```js
{
  name: "Mon Application",
  initials: "MA",
  image: "assets/img/mon-app.png",   // laissez "" pour afficher les initiales
  status: "live",                     // "live" | "soon" | ""
  statusLabel: "En ligne",
  category: "Application mobile",
  description: "Ce que fait l'application, pour qui, et pourquoi elle est utile.",
  tags: ["Android", "Web", "PWA"],
  url: "https://…",
  urlLabel: "Découvrir l'application"
}
```

## À compléter avant la mise en ligne

1. **Coordonnées** — cherchez `contact@jyssc.fr` et `+33 0 00 00 00 00` dans
   `index.html` et `assets/js/main.js`, remplacez par vos vraies coordonnées.
2. **Mentions légales** — tous les passages surlignés en jaune dans
   `mentions-legales.html` (nom, adresse, SIRET, hébergeur…). C'est une obligation légale.
3. **GenCoAide** — dans `assets/js/projects.js`, remplacez le texte
   `[À COMPLÉTER …]` par une vraie description et ajoutez le lien vers l'application.
4. **Nom de domaine** — remplacez `https://www.jyssc.fr/` dans `index.html`
   (balise `canonical`), `robots.txt` et `sitemap.xml`.

## Formulaire de contact

Par défaut, le formulaire ouvre le logiciel de messagerie du visiteur (aucun serveur requis).

Pour recevoir les messages directement par email :

1. Créez un compte gratuit sur [Formspree](https://formspree.io).
2. Copiez l'URL de votre formulaire (`https://formspree.io/f/xxxxxxxx`).
3. Collez-la dans `assets/js/main.js`, ligne `var FORMSPREE_ENDPOINT = "";`.

## Mise en ligne

Le site étant statique, toutes ces options fonctionnent :

- **Netlify / Cloudflare Pages / Vercel** — glissez-déposez le dossier, gratuit et instantané.
- **GitHub Pages** — poussez le dossier sur un dépôt, activez Pages.
- **Hébergement classique (OVH, Hostinger, Ionos…)** — envoyez les fichiers en FTP
  dans le dossier `www/` ou `public_html/`.

## Aperçu en local

Double-clic sur `index.html`, ou pour un rendu identique à la production :

```bash
python -m http.server 8000
# puis http://localhost:8000
```
