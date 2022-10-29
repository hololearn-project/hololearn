# Deployment readme

> Date:           03.06.2021\
> Written by:     Markus Trasberg & Otte van Dam

This document describes how to deploy the application using DigitalOcean and Let's Encrypt. 

## Domain

* For testing purposes, we have set up a new domain `www.hololearn.tech` through hostinger.com. Domain name is necessary to have a working HTTPS connection.
* In the domain hosting settings, we create a new DNS record with the following information: 
  * Type: `A` (indication of IPv4)
  * Name: `@` (the root)
  * Content: `xxx.xxx.xx.xx` (the IPv4 address of DigitalOcean droplet)
* Once this is created, all traffic from the domain will be directed to the DigitalOcean droplet.

## Server setup

* First create a DigitalOcean droplet. This can be done by navigating to digitalocean.com, logging in to an account and pressing the 'Create' button.
  * We used Ubuntu 18.04 (LTS) x64 server.
  * Server's size can be changed according to the needs of the application.
* Connect with the server through an SSH.
* For security reasons, we created different users with different roles, and disabled the root account. This is to help reduce any mischief.
* Next up we set up a basic firewall. This is to deny traffic except the standard web ports (like 80, 443) and allow SSH login.
  * `sudo ufw allow OpenSSH`
  * `sudo ufw allow http`
  * `sudo ufw allow https`
  * `sudo ufw enable`
* Now we need to install Git and Node. For Node, we used v12, but it should be compatible with newer versions, too. 
  * `sudo apt-get install git`
  * `curl -fsSL https://deb.nodesource.com/setup_12.x | sudo -E bash -`
  * `sudo apt-get install -y nodejs`
* Now let's clone our application.
  * `mkdir hololearn`
  * `git clone repo_name.git domain_name`
* The application should run by navigating to the correct folder and typing `node app.js`

## Process Manager

* To ensure that the application runs 24-7 and without external help, we need to use a process manager.  For this we use PM2. It gives us options to easily start, stop and restart our application.
* `sudo npm install -g pm2`
* Navigate to the app.js location.
* `pm2 start app.js`
* Now it's being run automatically. Use `pm2 status` to see all the running applications
* To ensure the application runs even after server restart, we need to enable pm2 startup:
  * `pm2 startup systemd`
  * PM2 prints out a line (starting with sudo). Write this into the terminal.
* Now PM2 is set up and will work even after server restarts. 
* To rerun the program, type `pm2 restart app`

## NGINX

* We need to redirect domain visitors to the application. For that, we use NGINX.
* `sudo apt-get install nginx`
* Let's serve all the traffic over SSL by redirecting any HTTP to HTTPS. 
  * `sudo nano /etc/nginx/sites-enabled/default`
  * Inside we can get rid of all the default settings and the following code (make sure to replace domain name and port, if applicable):

```
    server {
         listen 80;
         listen [::]:80 default_server ipv6only=on;
         return 301 https://$host$request_uri;
   }

    # HTTPS — proxy all requests to the Node app
    server {
        # Enable HTTP/2
        listen 443 ssl http2;
        listen [::]:443 ssl http2;
        server_name app.example.com;
        # Use the Let’s Encrypt certificates
        ssl_certificate /etc/letsencrypt/live/hololearn.tech/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/hololearn.tech/privkey.pem;
        # Include the SSL configuration from cipherli.st
        include snippets/ssl-params.conf;
        location / {
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-NginX-Proxy true;
            proxy_pass http://localhost:4000/;
            proxy_ssl_session_reuse off;
            proxy_set_header Host $http_host;
            proxy_cache_bypass $http_upgrade;
            proxy_redirect off;
         }
}
```

* We also need to create some SSL security parameters. Without going much into depth, here's how we approached it:
  
  * `sudo nano /etc/nginx/snippets/ssl-params.conf` (create new param conf)
  
  * Add the following:
    
    ```
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_prefer_server_ciphers on;
    ssl_ciphers "EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH";
    ssl_ecdh_curve secp384r1; # Requires nginx >= 1.1.0
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off; # Requires nginx >= 1.5.9
    ssl_stapling on; # Requires nginx >= 1.3.7
    ssl_stapling_verify on; # Requires nginx => 1.3.7
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    # Add our strong Diffie-Hellman group
    ssl_dhparam /etc/ssl/certs/dhparam.pem;
    ```

## Let's Encrpyt

* To set up SSL, we need to make use of Let's Encrypt. This can be installed using Certbot.
* Following things need to be installed:
  * `sudo apt install snapd` (usually already preinstalled)
  * `sudo snap install core`
  * `sudo snap refresh core`
* Then we can install the certbot: `sudo snap install --classic certbot`
* Ensure we can run certbot: `sudo ln -s /snap/bin/certbot /usr/bin/certbot`
* Now simply run this to get the certificate: `sudo certbot --nginx`
* To test that everything works fine, type `sudo nginx -t`. 
* Now let's run nginx: `sudo systemctl start nginx`. 
* Certbot should work! If you go to your domain, it should now be secured with HTTPS connection.

From here, the server should be deployed.

# Bug fixes

Unfortunately it will not always go the way you want it. Before you start doing big changes make sure you check the following:

- The domain is set to the correct IP-adress. If a digitalocean droplet is destroyed and a new one is created there will be a different IP-adress.

- That the application is actually running (Check process manager to run it)

- The firewall status `sudo ufw status` (you can always disable the firewall with `sudo ufw disable`)

## fullchain.pem no such directory

First remove nginx and certbot completely:

```
sudo apt-get purge nginx nginx-common
sudo apt-get autoremove
sudo snap remove certbot
```

Then we need to reinstall nginx but don't change the nginx files this time

```
sudo apt-get install nginx
```

Now we install certbot again and get the certificate

```
sudo snap install --classic certbot
sudo certbot --nginx
```

Now we can alter the files like we did above:

- Let's serve all the traffic over SSL by redirecting any HTTP to HTTPS.
  - `sudo nano /etc/nginx/sites-enabled/default`
  - Inside we can get rid of all the default settings and the following code (make sure to replace domain name and port, if applicable):

```
    server {
         listen 80;
         listen [::]:80 default_server ipv6only=on;
         return 301 https://$host$request_uri;
   }

    # HTTPS — proxy all requests to the Node app
    server {
        # Enable HTTP/2
        listen 443 ssl http2;
        listen [::]:443 ssl http2;
        server_name app.example.com;
        # Use the Let’s Encrypt certificates
        ssl_certificate /etc/letsencrypt/live/hololearn.tech/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/hololearn.tech/privkey.pem;
        # Include the SSL configuration from cipherli.st
        include snippets/ssl-params.conf;
        location / {
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-NginX-Proxy true;
            proxy_pass http://localhost:4000/;
            proxy_ssl_session_reuse off;
            proxy_set_header Host $http_host;
            proxy_cache_bypass $http_upgrade;
            proxy_redirect off;
         }
}
```

- We also need to create some SSL security parameters. Without going much into depth, here's how we approached it:
  
  - `sudo nano /etc/nginx/snippets/ssl-params.conf` (create new param conf)
  
  - Add the following:
    
    ```
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_prefer_server_ciphers on;
    ssl_ciphers "EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH";
    ssl_ecdh_curve secp384r1; # Requires nginx >= 1.1.0
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off; # Requires nginx >= 1.5.9
    ssl_stapling on; # Requires nginx >= 1.3.7
    ssl_stapling_verify on; # Requires nginx => 1.3.7
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    # Add our strong Diffie-Hellman group
    ssl_dhparam /etc/ssl/certs/dhparam.pem;
    ```

## dhparams.pem no such file

We can generate this file ourselves:

```
openssl dhparam -out dhparams.pem 4096
```

Now we need to move this file to the right location which is `/etc/ssl/certs/` in this case. We can do this with the following command

```
mv dhparam.pem /etc/ssl/certs/
```

Now we need to give it the right name (make sure you are in the correct folder):

```
mv dhparams.pem dhparam.pem
```