#!/usr/bin/env bash
# =============================================================================
#  Jyssc — activation de PHP pour le formulaire de contact
#
#  A lancer sur le serveur :  bash /var/www/jyssc/deploy/activer-php.sh
#
#  Ce script :
#    1. installe PHP-FPM s'il est absent
#    2. sauvegarde la configuration Nginx de jyssc AVANT toute modification
#    3. active le bloc PHP en detectant automatiquement la bonne version
#    4. teste la configuration, et RESTAURE la sauvegarde si le test echoue
#    5. cree le dossier de stockage des demandes
#
#  La configuration de happysales n'est jamais touchee.
# =============================================================================
set -uo pipefail

CONF="/etc/nginx/sites-available/jyssc"
DONNEES="/var/lib/jyssc"

echo "=== 1. Verification de PHP-FPM ==="
if ! ls /run/php/php*-fpm.sock >/dev/null 2>&1; then
    echo "PHP-FPM absent, installation en cours..."
    apt-get update -qq
    apt-get install -y php-fpm >/dev/null
else
    echo "PHP-FPM deja present."
fi

SOCKET="$(ls /run/php/php*-fpm.sock 2>/dev/null | head -1)"
if [ -z "$SOCKET" ]; then
    echo "ECHEC : impossible de trouver le socket PHP-FPM. Rien n'a ete modifie."
    exit 1
fi
echo "Socket detecte : $SOCKET"

echo
echo "=== 2. Sauvegarde de la configuration Nginx ==="
if [ ! -f "$CONF" ]; then
    echo "ECHEC : $CONF introuvable."
    exit 1
fi
SAUVEGARDE="${CONF}.avant-php"
cp "$CONF" "$SAUVEGARDE"
echo "Sauvegarde : $SAUVEGARDE"

echo
echo "=== 3. Activation du bloc PHP ==="
python3 - "$CONF" "$SOCKET" <<'PYTHON'
import re, sys

chemin, socket = sys.argv[1], sys.argv[2]
with open(chemin, encoding="utf-8") as f:
    contenu = f.read()

# Deja actif ?
if re.search(r"^[ \t]*location\s+~\s+\\\.php\$", contenu, re.M):
    print("Le bloc PHP est deja actif, rien a faire.")
    sys.exit(0)

bloc = (
    "    location ~ \\.php$ {\n"
    "        include snippets/fastcgi-php.conf;\n"
    "        fastcgi_pass unix:%s;\n"
    "    }\n" % socket
)

# Remplace le bloc commente prepare a l'avance
motif = re.compile(
    r"^[ \t]*#[ \t]*location ~ \\\.php\$ \{[\s\S]*?^[ \t]*#[ \t]*\}[ \t]*$",
    re.M,
)
contenu2, n = motif.subn(bloc.rstrip("\n"), contenu, count=1)

if n == 0:
    print("ECHEC : bloc PHP commente introuvable dans la configuration.")
    sys.exit(2)

with open(chemin, "w", encoding="utf-8") as f:
    f.write(contenu2)
print("Bloc PHP active.")
PYTHON

if [ $? -ne 0 ]; then
    echo "Restauration de la sauvegarde."
    cp "$SAUVEGARDE" "$CONF"
    exit 1
fi

echo
echo "=== 4. Test de la configuration Nginx ==="
if nginx -t; then
    systemctl reload nginx
    echo "Nginx recharge."
else
    echo "TEST ECHOUE : restauration de la configuration precedente."
    cp "$SAUVEGARDE" "$CONF"
    nginx -t && systemctl reload nginx
    exit 1
fi

echo
echo "=== 5. Dossier de stockage des demandes ==="
mkdir -p "$DONNEES"
chown -R www-data:www-data "$DONNEES"
chmod 750 "$DONNEES"
echo "Dossier pret : $DONNEES"

echo
echo "=== 6. Verification ==="
php -v | head -1
curl -s -o /dev/null -w "POST vide sur contact.php -> HTTP %{http_code} (422 attendu)\n" \
     -X POST -H "Content-Type: application/json" -d '{}' https://www.jyssc.fr/contact.php

echo
echo "TERMINE. Le formulaire de https://www.jyssc.fr est actif."
echo "Les demandes sont enregistrees dans $DONNEES/demandes.jsonl"
