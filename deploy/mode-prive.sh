#!/usr/bin/env bash
# =============================================================================
#  Jyssc — rendre le site prive (mot de passe) ou public
#
#  Rendre prive  :  bash /var/www/jyssc/deploy/mode-prive.sh on
#  Rendre public :  bash /var/www/jyssc/deploy/mode-prive.sh off
#  Voir l'etat   :  bash /var/www/jyssc/deploy/mode-prive.sh etat
#
#  Sauvegarde la configuration avant modification et la restaure
#  automatiquement si le test Nginx echoue. Ne touche jamais a happysales.
# =============================================================================
set -uo pipefail

CONF="/etc/nginx/sites-available/jyssc"
HTPASSWD="/etc/nginx/.htpasswd-jyssc"
ACTION="${1:-}"

if [ ! -f "$CONF" ]; then
    echo "ECHEC : $CONF introuvable."
    exit 1
fi

etat() {
    if grep -q "JYSSC-PRIVE" "$CONF"; then
        echo "ETAT : le site est PRIVE (mot de passe demande)."
    else
        echo "ETAT : le site est PUBLIC (accessible a tous)."
    fi
}

case "$ACTION" in
  etat)
    etat
    exit 0
    ;;

  on)
    if grep -q "JYSSC-PRIVE" "$CONF"; then
        echo "Le site est deja prive. Rien a faire."
        echo "Pour changer le mot de passe : htpasswd $HTPASSWD <identifiant>"
        exit 0
    fi

    echo "=== 1. Outil de mot de passe ==="
    if ! command -v htpasswd >/dev/null 2>&1; then
        echo "Installation en cours..."
        apt-get update -qq
        apt-get install -y apache2-utils >/dev/null
    fi
    echo "Present."

    echo
    echo "=== 2. Creation de votre identifiant ==="
    if [ ! -f "$HTPASSWD" ]; then
        echo "Choisissez un mot de passe (il sera demande deux fois)."
        echo "Identifiant : yves"
        htpasswd -c "$HTPASSWD" yves || { echo "Annule."; exit 1; }
        chown root:www-data "$HTPASSWD"
        chmod 640 "$HTPASSWD"
    else
        echo "Identifiant deja existant, conserve."
    fi

    echo
    echo "=== 3. Sauvegarde de la configuration ==="
    cp "$CONF" "${CONF}.avant-prive"
    echo "Sauvegarde : ${CONF}.avant-prive"

    echo
    echo "=== 4. Activation de la protection ==="
    python3 - "$CONF" <<'PYTHON'
import re, sys
chemin = sys.argv[1]
with open(chemin, encoding="utf-8") as f:
    contenu = f.read()

bloc = """    # >>> JYSSC-PRIVE
    auth_basic "Site en construction";
    auth_basic_user_file /etc/nginx/.htpasswd-jyssc;
    # Le renouvellement du certificat HTTPS doit rester accessible sans mot de passe
    location ^~ /.well-known/acme-challenge/ {
        auth_basic off;
        root /var/www/jyssc;
    }
    # <<< JYSSC-PRIVE
"""

motif = re.compile(r"^([ \t]*)root[ \t]+/var/www/jyssc;[ \t]*$", re.M)
contenu2, n = motif.subn(lambda m: m.group(0) + "\n\n" + bloc.rstrip("\n"), contenu, count=1)

if n == 0:
    print("ECHEC : ligne 'root /var/www/jyssc;' introuvable.")
    sys.exit(2)

with open(chemin, "w", encoding="utf-8") as f:
    f.write(contenu2)
print("Protection ajoutee.")
PYTHON
    if [ $? -ne 0 ]; then
        cp "${CONF}.avant-prive" "$CONF"
        echo "Restauration effectuee, rien n'a change."
        exit 1
    fi
    ;;

  off)
    if ! grep -q "JYSSC-PRIVE" "$CONF"; then
        echo "Le site est deja public. Rien a faire."
        exit 0
    fi

    echo "=== Sauvegarde de la configuration ==="
    cp "$CONF" "${CONF}.avant-public"

    echo "=== Retrait de la protection ==="
    python3 - "$CONF" <<'PYTHON'
import re, sys
chemin = sys.argv[1]
with open(chemin, encoding="utf-8") as f:
    contenu = f.read()

motif = re.compile(r"\n*^[ \t]*# >>> JYSSC-PRIVE$.*?^[ \t]*# <<< JYSSC-PRIVE$\n?", re.M | re.S)
contenu2, n = motif.subn("\n", contenu, count=1)

if n == 0:
    print("ECHEC : marqueurs introuvables.")
    sys.exit(2)

with open(chemin, "w", encoding="utf-8") as f:
    f.write(contenu2)
print("Protection retiree.")
PYTHON
    if [ $? -ne 0 ]; then
        cp "${CONF}.avant-public" "$CONF"
        echo "Restauration effectuee, rien n'a change."
        exit 1
    fi
    ;;

  *)
    echo "Usage : bash mode-prive.sh on|off|etat"
    echo
    etat
    exit 1
    ;;
esac

echo
echo "=== Test de la configuration Nginx ==="
if nginx -t; then
    systemctl reload nginx
    echo "Nginx recharge."
else
    echo "TEST ECHOUE : restauration de la configuration precedente."
    if [ "$ACTION" = "on" ]; then cp "${CONF}.avant-prive" "$CONF"; else cp "${CONF}.avant-public" "$CONF"; fi
    nginx -t && systemctl reload nginx
    exit 1
fi

echo
etat
