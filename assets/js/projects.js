/* ==========================================================================
   Jyssc — catalogue des réalisations
   --------------------------------------------------------------------------
   POUR AJOUTER UNE RÉALISATION (par exemple le site d'un client) : copiez un
   bloc { ... } ci-dessous, collez-le dans la liste et modifiez les valeurs.
   Rien d'autre à toucher.

   name        : nom de l'application ou du site
   initials    : 2-3 lettres affichées sur la vignette (si pas d'image)
   image       : (optionnel) "assets/img/mon-app.webp" — remplace les initiales
   screenshot  : (optionnel) true si l'image est une capture d'écran de site
   illustration: (optionnel) true si l'image est une illustration qui remplit la vignette
   cover       : (optionnel) fond de la vignette, couleur ou dégradé CSS
   status      : "live" (en ligne) | "soon" (en développement) | "demo" | "" (aucun)
   statusLabel : texte du badge de statut
   category    : petit libellé (Application web, Site vitrine…)
   description : 1 à 3 phrases de présentation
   tags        : mots-clés
   url         : lien ("" pour masquer le bouton)
   urlLabel    : texte du bouton
   links       : (optionnel) plusieurs boutons : [{ url: "…", label: "…" }, …]
   offer       : (optionnel) lien vers l'offre : { label: "Votre … : prix", href: "#offre-…" }
   ========================================================================== */

window.JYSSC_PROJECTS = [
  {
    name: "Menuiserie Martin",
    initials: "MM",
    image: "assets/img/demo-menuiserie-martin.webp",
    screenshot: true,
    cover: "linear-gradient(160deg, #F6EEE6, #EBDDD0)",
    status: "demo",
    statusLabel: "Exemple",
    category: "Site vitrine",
    description:
      "Un exemple complet de ce que comprend l'offre site vitrine : accueil, réalisations, " +
      "présentation de l'atelier, formulaire de contact, le tout adapté au téléphone. " +
      "Menuiserie Martin est une entreprise imaginaire, créée pour vous montrer le résultat.",
    tags: ["4 pages", "Formulaire de contact", "Mobile", "Entreprise imaginaire"],
    url: "https://demo.jyssc.fr",
    urlLabel: "Voir le site d'exemple",
    offer: { label: "Votre site vitrine : 35 €/mois", href: "#offre-vitrine" }
  },
  {
    name: "Les Plaisirs du Terroir Aindinois",
    initials: "PT",
    image: "assets/img/demo-epicerie.webp",
    screenshot: true,
    cover: "linear-gradient(160deg, #F3EBDD, #E3D3BC)",
    status: "demo",
    statusLabel: "Exemple",
    category: "Boutique en ligne",
    description:
      "Un exemple de boutique en ligne : catalogue par rayons, panier, commande et compte client. " +
      "Le commerçant gère lui-même ses produits, ses prix et ses promotions. " +
      "Une épicerie imaginaire, créée pour vous montrer le résultat.",
    tags: ["Catalogue par rayons", "Panier et commande", "Promotions", "Entreprise imaginaire"],
    url: "https://demo-epicerie.jyssc.fr",
    urlLabel: "Voir la boutique d'exemple",
    offer: { label: "Votre boutique : dès 69 €/mois", href: "#offre-boutique" }
  },
  {
    name: "Lotissement du Clos des Éparres",
    initials: "CE",
    image: "assets/img/demo-lotissement.webp",
    illustration: true,
    cover: "linear-gradient(160deg, #F4F6F0, #E2EBDD)",
    status: "demo",
    statusLabel: "Exemple",
    category: "Application pour associations",
    description:
      "L'application privée des habitants d'un lotissement : annonces du bureau, boîte aux lettres " +
      "entre voisins, calendrier avec rappels, moments conviviaux, tours de rôle, documents, votes " +
      "en ligne et comptes de l'association. Tout se gère depuis le téléphone. " +
      "Découvrez-la sans mot de passe, comme habitant ou comme président du bureau.",
    tags: ["Annonces", "Votes en ligne", "Calendrier", "Comptes de l'association"],
    url: "https://demo-lotissement.jyssc.fr",
    urlLabel: "Découvrir l'application",
    links: [
      { url: "https://demo-lotissement.jyssc.fr/decouvrir/habitant", label: "Je suis habitant" },
      { url: "https://demo-lotissement.jyssc.fr/decouvrir/bureau", label: "Je suis président du bureau" }
    ],
    offer: { label: "L'application de votre lotissement : 2 €/mois par lot", href: "#offre-lotissement" }
  },
  {
    name: "GencoAide",
    initials: "GA",
    image: "assets/img/gencoaide.webp",
    cover: "radial-gradient(420px 260px at 85% 100%, #FDEBDD, #FFFFFF 70%)",
    status: "live",
    statusLabel: "En ligne",
    category: "Application web & mobile",
    description:
      "L'assistant administratif du quotidien. Prenez un papier en photo : GencoAide le lit, " +
      "le classe automatiquement au bon endroit et n'oublie aucune échéance. Il monte aussi " +
      "vos dossiers CAF, retraite, MDPH ou logement en vous indiquant les pièces manquantes, " +
      "et permet d'aider un proche sans jamais empiéter sur sa vie privée. " +
      "Documents chiffrés en AES-256, hébergés en Europe.",
    tags: ["Classement automatique", "Hors connexion", "Chiffrement AES-256", "RGPD · Europe"],
    url: "https://gencoaide.fr",
    urlLabel: "Découvrir GencoAide"
  }
];
