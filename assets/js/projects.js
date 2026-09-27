/* ==========================================================================
   Jyssc — catalogue des réalisations
   --------------------------------------------------------------------------
   POUR AJOUTER UNE RÉALISATION (par exemple le site d'un client) : copiez un
   bloc { ... } ci-dessous, collez-le dans la liste et modifiez les valeurs.
   Rien d'autre à toucher.

   name        : nom de l'application ou du site
   initials    : 2-3 lettres affichées sur la vignette (si pas d'image)
   image       : (optionnel) "assets/img/mon-app.webp" — remplace les initiales
   cover       : (optionnel) fond de la vignette, couleur ou dégradé CSS
   status      : "live" (en ligne) | "soon" (en développement) | "" (aucun)
   statusLabel : texte du badge de statut
   category    : petit libellé (Application web, Site vitrine…)
   description : 1 à 3 phrases de présentation
   tags        : mots-clés
   url         : lien ("" pour masquer le bouton)
   urlLabel    : texte du bouton
   ========================================================================== */

window.JYSSC_PROJECTS = [
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
