# Déploiement de jyssc.fr sur le VPS IONOS

Serveur : **82.165.247.186** — Ubuntu 24.04 — un autre site tourne déjà dessus.

Le principe : le serveur récupère le site **directement depuis GitHub**. Aucun envoi
FTP, aucun glisser-déposer. Pour publier une modification, une seule commande : `git pull --ff-only`.

> ⚠️ Toutes les commandes ci-dessous n'ajoutent QUE des fichiers propres à `jyssc`.
> Rien ne touche à la configuration du site déjà en place.

---

## Étape 1 — Récupérer le site sur le serveur

Le dépôt est public, aucun identifiant n'est nécessaire.

```bash
sudo mkdir -p /var/www
sudo git clone https://github.com/joannonyves-max/JYSSC.git /var/www/jyssc
```

Le site **reste la propriété de root** (`root:root`, fichiers lisibles par tous) :
ni nginx ni PHP ne peuvent modifier le code, le dépôt `.git` ou les scripts de
`deploy/`. **Ne jamais faire de `chown www-data` sur `/var/www/jyssc`.**

Vérification :

```bash
ls /var/www/jyssc      # doit afficher index.html, assets, README.md...
```

---

## Étape 2 — Créer le virtual host

### Si le serveur tourne sous **Nginx**

```bash
sudo cp /var/www/jyssc/deploy/nginx-jyssc.conf /etc/nginx/sites-available/jyssc
sudo ln -s /etc/nginx/sites-available/jyssc /etc/nginx/sites-enabled/jyssc
sudo nginx -t                    # doit afficher "syntax is ok" + "test is successful"
sudo systemctl reload nginx
```

### Si le serveur tourne sous **Apache**

```bash
sudo cp /var/www/jyssc/deploy/apache-jyssc.conf /etc/apache2/sites-available/jyssc.conf
sudo a2ensite jyssc
sudo a2enmod rewrite headers deflate expires
sudo apache2ctl configtest       # doit afficher "Syntax OK"
sudo systemctl reload apache2
```

**Si `nginx -t` ou `configtest` renvoie une erreur : ne rechargez pas et envoyez-moi
le message.** Tant qu'on ne recharge pas, le site existant n'est pas impacté.

---

## Étape 2 bis — PHP du formulaire : pool dédié `jyssc-site`

Seule l'adresse exacte `/contact.php` est transmise à PHP (voir `nginx-jyssc.conf`),
par un pool PHP-FPM **réservé au site**, sous un utilisateur sans connexion
possible. Tout autre `.php` répond 404. Mis en place le 23/10/2026.

| Élément | Valeur |
|---|---|
| Utilisateur | `jyssc-site` (système, `nologin`), groupe supplémentaire `jyssc-envoi` (lecture de la config d'envoi msmtp) |
| Pool | `/etc/php/8.3/fpm/pool.d/jyssc-site.conf` |
| Socket | `/run/php/jyssc-site.sock` (`www-data:www-data`, 0660) |
| Seule écriture | `/var/lib/jyssc` (`jyssc-site:jyssc-site`, 750) et `/var/lib/jyssc/tmp` (700) |
| Nettoyage nocturne | `/etc/cron.d/jyssc-nettoyage`, à 4 h 15, sous `jyssc-site` |

Pour réinstaller sur un serveur neuf (en root) :

```bash
useradd --system --no-create-home --shell /usr/sbin/nologin jyssc-site
usermod -aG jyssc-envoi jyssc-site
install -d -o jyssc-site -g jyssc-site -m 750 /var/lib/jyssc
install -d -o jyssc-site -g jyssc-site -m 700 /var/lib/jyssc/tmp
```

Contenu de `/etc/php/8.3/fpm/pool.d/jyssc-site.conf` :

```ini
[jyssc-site]

user = jyssc-site
group = jyssc-site

listen = /run/php/jyssc-site.sock
listen.owner = www-data
listen.group = www-data
listen.mode = 0660

pm = ondemand
pm.max_children = 3
pm.process_idle_timeout = 60s
pm.max_requests = 500

php_admin_value[open_basedir] = /var/www/jyssc/:/var/lib/jyssc/
php_admin_value[upload_tmp_dir] = /var/lib/jyssc/tmp
php_admin_value[sys_temp_dir] = /var/lib/jyssc/tmp

php_admin_flag[file_uploads] = off
php_admin_value[post_max_size] = 64K
php_admin_flag[allow_url_fopen] = off
php_admin_flag[display_errors] = off
php_admin_flag[log_errors] = on

php_admin_value[disable_functions] = exec,passthru,shell_exec,system,proc_open,popen,pcntl_exec,putenv

security.limit_extensions = .php
catch_workers_output = yes
```

Puis `php-fpm8.3 -t && systemctl reload php8.3-fpm`, **avant** d'activer le
virtual host (sinon le formulaire répond 502). Tâche de nettoyage :

```bash
echo '15 4 * * * jyssc-site /usr/bin/php /var/www/jyssc/deploy/nettoyage-donnees.php >> /var/lib/jyssc/nettoyage.log 2>&1' > /etc/cron.d/jyssc-nettoyage
```

---

## Étape 3 — Faire pointer le domaine (chez OVH)

Espace client OVH → domaine `jyssc.fr` → onglet **Zone DNS**.

Modifiez les deux entrées qui pointent actuellement sur `213.186.33.5`
(le parking OVH) pour les faire pointer sur le VPS :

| Type | Sous-domaine | Cible |
|------|--------------|-------------------|
| A    | *(vide)*     | `82.165.247.186`  |
| A    | `www`        | `82.165.247.186`  |

Ne touchez à aucune autre ligne (MX, TXT, NS…).

Propagation : 1 à 4 h en général. Pour suivre l'avancement depuis votre PC :

```bash
nslookup jyssc.fr
# quand la réponse affiche 82.165.247.186, c'est propagé
```

---

## Étape 4 — Activer le HTTPS

**Uniquement une fois le DNS propagé** : certbot vérifie que le domaine pointe bien
sur le serveur, il échouera sinon.

```bash
# Nginx
sudo certbot --nginx -d jyssc.fr -d www.jyssc.fr

# Apache
sudo certbot --apache -d jyssc.fr -d www.jyssc.fr
```

Répondez **oui** à la redirection automatique HTTP → HTTPS. Le renouvellement du
certificat est ensuite automatique (tous les 90 jours).

Si certbot n'est pas installé : `sudo apt install certbot python3-certbot-nginx`
(ou `python3-certbot-apache`).

---

## Publier une modification, ensuite

Depuis mon poste, je fais `git push`. Puis sur le serveur :

```bash
cd /var/www/jyssc
sudo git pull --ff-only
```

C'est tout. Deux secondes, aucune interruption de service. **Aucun `chown`
ensuite** : les fichiers récupérés par root restent à `root:root`, c'est voulu.

### Version automatisée (optionnelle)

Pour n'avoir plus rien à taper, on pourra mettre en place un déploiement
automatique déclenché par GitHub à chaque `push`. À voir quand le reste tournera.

---

## En cas de problème

| Symptôme | Cause probable |
|---|---|
| Le site existant s'affiche sur jyssc.fr | Le virtual host n'est pas activé, ou `server_name` incorrect |
| Erreur 403 | Droits de lecture : fichiers en 644 et dossiers en 755, propriétaire `root:root` (ne **pas** donner le site à `www-data`) |
| Formulaire en erreur 502 | Pool `jyssc-site` absent ou arrêté : `ls -l /run/php/jyssc-site.sock`, `systemctl status php8.3-fpm` |
| Erreur 404 | Mauvais `root` / `DocumentRoot`, ou dépôt cloné au mauvais endroit |
| certbot échoue | DNS pas encore propagé, ou port 80 fermé au pare-feu |

Journaux dédiés au site :

```bash
sudo tail -f /var/log/nginx/jyssc.error.log      # Nginx
sudo tail -f /var/log/apache2/jyssc.error.log    # Apache
```
