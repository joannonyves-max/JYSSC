# Déploiement de jyssc.fr sur le VPS IONOS

Serveur : **82.165.247.186** — Ubuntu 24.04 — un autre site tourne déjà dessus.

Le principe : le serveur récupère le site **directement depuis GitHub**. Aucun envoi
FTP, aucun glisser-déposer. Pour publier une modification, une seule commande : `git pull`.

> ⚠️ Toutes les commandes ci-dessous n'ajoutent QUE des fichiers propres à `jyssc`.
> Rien ne touche à la configuration du site déjà en place.

---

## Étape 1 — Récupérer le site sur le serveur

Le dépôt est public, aucun identifiant n'est nécessaire.

```bash
sudo mkdir -p /var/www
sudo git clone https://github.com/joannonyves-max/JYSSC.git /var/www/jyssc
sudo chown -R www-data:www-data /var/www/jyssc
```

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
cd /var/www/jyssc && sudo git pull
```

C'est tout. Deux secondes, aucune interruption de service.

### Version automatisée (optionnelle)

Pour n'avoir plus rien à taper, on pourra mettre en place un déploiement
automatique déclenché par GitHub à chaque `push`. À voir quand le reste tournera.

---

## En cas de problème

| Symptôme | Cause probable |
|---|---|
| Le site existant s'affiche sur jyssc.fr | Le virtual host n'est pas activé, ou `server_name` incorrect |
| Erreur 403 | Droits : refaire `sudo chown -R www-data:www-data /var/www/jyssc` |
| Erreur 404 | Mauvais `root` / `DocumentRoot`, ou dépôt cloné au mauvais endroit |
| certbot échoue | DNS pas encore propagé, ou port 80 fermé au pare-feu |

Journaux dédiés au site :

```bash
sudo tail -f /var/log/nginx/jyssc.error.log      # Nginx
sudo tail -f /var/log/apache2/jyssc.error.log    # Apache
```
