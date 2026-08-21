/* ==========================================================================
   Jyssc — catalogue des réalisations
   --------------------------------------------------------------------------
   POUR AJOUTER UNE NOUVELLE APPLICATION : copiez un bloc { ... } ci-dessous,
   collez-le dans la liste et modifiez les valeurs. Rien d'autre à toucher.

   name        : nom de l'application
   initials    : 2-3 lettres affichées sur la vignette (si pas d'image)
   image       : (optionnel) "assets/img/mon-app.png" — remplace les initiales
   status      : "live" (en ligne) | "soon" (en développement) | "" (aucun)
   statusLabel : texte du badge de statut
   category    : petit libellé (Application mobile, Site web, Outil…)
   description : 1 à 3 phrases de présentation
   tags        : technologies ou mots-clés
   url         : lien vers l'application ("" pour masquer le bouton)
   urlLabel    : texte du bouton principal
   ========================================================================== */

window.JYSSC_PROJECTS = [
  {
    name: "GenCoAide",
    initials: "GC",
    image: "",
    status: "live",
    statusLabel: "En ligne",
    category: "Application",
    description:
      "Ma première application, pensée pour simplifier le quotidien de ses utilisateurs. " +
      "Un outil simple, accessible et conçu pour aller droit au but. " +
      "[À COMPLÉTER : décrivez ici précisément ce que fait GenCoAide et pour qui.]",
    tags: ["Application", "Web", "Mobile"],
    url: "",
    urlLabel: "Découvrir l'application"
  },
  {
    name: "Votre projet ?",
    initials: "+",
    image: "",
    status: "soon",
    statusLabel: "Disponible",
    category: "Nouveau projet",
    description:
      "Cette place est libre. Vous avez une idée d'application, de site internet ou " +
      "d'outil numérique ? Parlons-en : le devis est gratuit et sans engagement.",
    tags: ["Sur mesure", "Web", "Mobile", "Outils"],
    url: "#contact",
    urlLabel: "Proposer un projet"
  }
];
