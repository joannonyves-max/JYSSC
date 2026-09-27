<?php
/* =============================================================================
   Jyssc — traitement du formulaire de contact
   -----------------------------------------------------------------------------
   Recoit la demande, la valide, l'enregistre sur le serveur puis l'envoie
   par email. L'enregistrement est fait AVANT l'envoi : meme si le mail
   echoue, aucune demande client n'est perdue.

   Reglages : voir le bloc CONFIGURATION ci-dessous.
   ============================================================================= */

// ---------------------------------------------------------------- CONFIGURATION
$DESTINATAIRE   = 'contact@jyssc.fr';        // ou l'adresse arrivant sur Outlook
$EXPEDITEUR     = 'no-reply@jyssc.fr';       // doit rester sur le domaine du site
$SITE           = 'Jyssc';
$DOSSIER_DONNEES = '/var/lib/jyssc';         // HORS du dossier web, volontairement
$DELAI_ANTISPAM = 30;                        // secondes minimum entre 2 envois / IP
// ------------------------------------------------------------------------------

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function repondre(int $code, string $message, bool $ok = false): void {
    http_response_code($code);
    echo json_encode(['ok' => $ok, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    repondre(405, "Methode non autorisee.");
}

// --- Lecture : accepte le JSON comme le formulaire classique -------------------
$brut = file_get_contents('php://input');
$data = json_decode($brut, true);
if (!is_array($data)) {
    $data = $_POST;
}

$champ = static function (string $cle) use ($data): string {
    return isset($data[$cle]) ? trim((string) $data[$cle]) : '';
};

// --- Piege a robots : champ invisible, un humain ne le remplit jamais ----------
if ($champ('website') !== '') {
    repondre(200, "Merci, votre message a bien ete envoye.", true); // silence volontaire
}

// Choix proposés par le formulaire guidé : toute autre valeur est ignorée.
$CHOIX = [
    'activite' => ['Artisan', 'Indépendant / profession libérale', 'Commerce', 'Association', 'Particulier', 'Autre'],
    'besoin'   => ['Site vitrine', 'Application métier', 'Petit outil sur devis', 'Autre'],
    'formule'  => ['Abonnement mensuel', 'Paiement en une fois', 'Je ne sais pas encore'],
    'delai'    => ['Dès que possible', 'Dans 1 à 3 mois', 'Dans plus de 3 mois', 'Pas de date précise'],
];
$choix = static function (string $cle) use ($champ, $CHOIX): string {
    $valeur = $champ($cle);
    return in_array($valeur, $CHOIX[$cle], true) ? $valeur : '';
};

$nom      = $champ('name');
$email    = $champ('email');
$tel      = $champ('phone');
$activite = $choix('activite');
$metier   = $champ('metier');
$besoin   = $choix('besoin');
$formule  = $choix('formule');
$delai    = $choix('delai');
$message  = $champ('message');

// --- Validation ----------------------------------------------------------------
$erreurs = [];
if ($nom === '' || mb_strlen($nom) > 100) {
    $erreurs[] = "Merci d'indiquer votre nom.";
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 150) {
    $erreurs[] = "Merci d'indiquer une adresse email valide.";
}
if ($tel !== '' && !preg_match('/^[0-9 +().\-]{6,30}$/', $tel)) {
    $erreurs[] = "Le numéro de téléphone semble incorrect.";
}
if ($activite === '') {
    $erreurs[] = "Merci de choisir votre activité.";
}
if ($besoin === '') {
    $erreurs[] = "Merci de choisir le type de besoin.";
}
if (mb_strlen($message) < 10 || mb_strlen($message) > 5000) {
    $erreurs[] = "Merci de décrire votre objectif (10 caractères minimum).";
}
if (mb_strlen($metier) > 100) {
    $metier = mb_substr($metier, 0, 100);
}
// Injection d'en-tetes : un email legitime ne contient jamais de saut de ligne
if (preg_match('/[\r\n]/', $nom . $email . $tel . $metier)) {
    repondre(400, "Requete invalide.");
}
$sujet = $besoin;
if ($erreurs) {
    repondre(422, implode(' ', $erreurs));
}

// --- Anti-flood par adresse IP -------------------------------------------------
if (!is_dir($DOSSIER_DONNEES)) {
    @mkdir($DOSSIER_DONNEES, 0750, true);
}
$ip      = $_SERVER['REMOTE_ADDR'] ?? 'inconnue';
$marqueur = $DOSSIER_DONNEES . '/last-' . md5($ip) . '.txt';
if (is_file($marqueur) && (time() - (int) filemtime($marqueur)) < $DELAI_ANTISPAM) {
    repondre(429, "Vous venez d'envoyer un message. Merci de patienter un instant.");
}
@touch($marqueur);

// --- Enregistrement AVANT envoi : rien ne se perd -------------------------------
$horodatage = date('Y-m-d H:i:s');
$entree = [
    'date'     => $horodatage,
    'nom'      => $nom,
    'email'    => $email,
    'tel'      => $tel,
    'activite' => $activite,
    'metier'   => $metier,
    'besoin'   => $besoin,
    'formule'  => $formule,
    'delai'    => $delai,
    'message'  => $message,
    'ip'       => $ip,
];
@file_put_contents(
    $DOSSIER_DONNEES . '/demandes.jsonl',
    json_encode($entree, JSON_UNESCAPED_UNICODE) . PHP_EOL,
    FILE_APPEND | LOCK_EX
);

// --- Envoi de l'email ----------------------------------------------------------
$objet = sprintf('[%s] %s - %s', $SITE, $sujet, $nom);

$nonPrecise = static fn (string $v): string => $v !== '' ? $v : '-';
$activiteComplete = $activite . ($metier !== '' ? " ({$metier})" : '');
$telAffiche    = $nonPrecise($tel);
$formuleAffichee = $nonPrecise($formule);
$delaiAffiche  = $nonPrecise($delai);

$corps = <<<TXT
Nouvelle demande recue depuis {$SITE}.

Nom       : {$nom}
Email     : {$email}
Telephone : {$telAffiche}
Activite  : {$activiteComplete}
Besoin    : {$besoin}
Formule   : {$formuleAffichee}
Delai     : {$delaiAffiche}
Date      : {$horodatage}

Objectif :
{$message}

--
Repondre directement a ce message contacte {$nom}.
TXT;

$entetes = [
    'From: ' . $SITE . ' <' . $EXPEDITEUR . '>',
    'Reply-To: ' . $nom . ' <' . $email . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: PHP/' . phpversion(),
];

$envoye = @mail(
    $DESTINATAIRE,
    '=?UTF-8?B?' . base64_encode($objet) . '?=',
    $corps,
    implode("\r\n", $entetes),
    '-f' . $EXPEDITEUR
);

if ($envoye) {
    repondre(200, "Merci ! Votre demande a bien ete envoyee. Je vous reponds rapidement.", true);
}

// L'email a echoue mais la demande est enregistree : on ne ment pas au visiteur,
// on ne l'inquiete pas non plus inutilement.
repondre(200, "Merci ! Votre demande a bien ete enregistree. Je vous reponds rapidement.", true);
