#!/usr/bin/env bash
# =============================================================================
#  Jyssc — activation de PHP pour le formulaire de contact : OBSOLÈTE
#
#  Depuis le 23/10/2026, le formulaire tourne sur un pool PHP-FPM dédié
#  (jyssc-site) et seule l'adresse /contact.php est transmise à PHP.
#  L'ancienne version de ce script activait une règle PHP générale sur le pool
#  www et donnait /var/lib/jyssc à www-data : elle ne doit plus être utilisée.
#
#  Procédure à jour : deploy/DEPLOIEMENT.md, « Étape 2 bis ».
#  Ce script ne modifie rien.
# =============================================================================
echo "activer-php.sh est obsolète : rien n'a été modifié." >&2
echo "Voir deploy/DEPLOIEMENT.md, « Étape 2 bis — PHP du formulaire : pool dédié jyssc-site »." >&2
exit 1
