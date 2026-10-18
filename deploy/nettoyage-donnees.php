<?php
/* =============================================================================
   Jyssc — nettoyage quotidien des données du formulaire de contact
   -----------------------------------------------------------------------------
   RGPD, limitation de la conservation : on ne garde que ce qui est annoncé
   dans les mentions légales (section « Données personnelles »).

   - fichiers anti-abus (last-*, accuses-*) : supprimés après 2 jours ;
   - demandes de contact (demandes.jsonl) : retirées après 3 ans.

   Lancé chaque nuit par cron, avec les droits du site (www-data) :
       15 4 * * * www-data /usr/bin/php /var/www/jyssc/deploy/nettoyage-donnees.php
   Test sur un autre dossier :
       php deploy/nettoyage-donnees.php /chemin/vers/un/dossier/de/test
   ============================================================================= */

// Uniquement en ligne de commande : jamais depuis un navigateur.
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$dossier    = $argv[1] ?? '/var/lib/jyssc';
$maintenant = time();

// --- 1. Fichiers anti-abus de plus de 2 jours ---------------------------------
$fichiersSupprimes = 0;
foreach (array_merge(glob($dossier . '/last-*.txt') ?: [], glob($dossier . '/accuses-*.txt') ?: []) as $f) {
    if (is_file($f) && $maintenant - (int) filemtime($f) > 2 * 86400 && @unlink($f)) {
        $fichiersSupprimes++;
    }
}

// --- 2. Demandes de plus de 3 ans ----------------------------------------------
// Même verrou que contact.php (FILE_APPEND | LOCK_EX) : une demande qui arrive
// pendant le nettoyage attend la fin et n'est jamais perdue.
// Dans le doute (ligne illisible, date absente), la ligne est gardée.
$demandesRetirees = 0;
$fichier = $dossier . '/demandes.jsonl';
if (is_file($fichier)) {
    $h = fopen($fichier, 'c+');
    if ($h === false) {
        fwrite(STDERR, "Impossible d'ouvrir $fichier\n");
        exit(1);
    }
    flock($h, LOCK_EX);
    $limite = strtotime('-3 years', $maintenant);
    $gardees = [];
    while (($ligne = fgets($h)) !== false) {
        $texte = rtrim($ligne, "\r\n");
        if ($texte === '') {
            continue;
        }
        $entree = json_decode($texte, true);
        $date = is_array($entree) && isset($entree['date']) ? strtotime((string) $entree['date']) : false;
        if ($date !== false && $date < $limite) {
            $demandesRetirees++;
            continue;
        }
        $gardees[] = $texte;
    }
    if ($demandesRetirees > 0) {
        ftruncate($h, 0);
        rewind($h);
        fwrite($h, $gardees ? implode(PHP_EOL, $gardees) . PHP_EOL : '');
        fflush($h);
    }
    flock($h, LOCK_UN);
    fclose($h);
}

echo date('Y-m-d H:i:s') . " — fichiers anti-abus supprimés : $fichiersSupprimes, demandes de plus de 3 ans retirées : $demandesRetirees" . PHP_EOL;
