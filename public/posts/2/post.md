# Introduction to Drupal

Drupal is a CMS, or Content Management System, which is simply a fancy way of saying "Wordpress but open-source". As part of my job at VeroSource Solutions, I've been maintaining a number of Drupal websites that each hosted slightly differently and using different paradigms. In this article I want to explain the absolute basics you need to start using Drupal.

![arch basic](/assets/arc.jpg)

Your bog standard Drupal setup is simply the one you'll find in a typical [Drupal docker container](https://hub.docker.com/_/drupal). That is, you have PHP installed on the system served by an Apache server with your Drupal code dropped into your server directory (IE: `/var/www/html`) and a database instance of some kind to connect to. But this alone isn't ready to start working on immediately. We'll need to make some changes, first.

```
version: '3.8'

services:
  drupal:
    container_name: example-drupal
    image: example-drupal:latest
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8080:80"
    volumes:
      - drupal_volume:/opt/drupal/web/sites/default/files
      - ./settings.custom.php:/opt/drupal/web/sites/default/settings.custom.php
    restart: always
    env_file:
      - .env

  db:
    image: mysql:latest
    volumes:
      - db_volume:/var/lib/mysql
    restart: always
    env_file:
      - .env

volumes:
  db_volume:
  drupal_volume:

```

Create an `.env` with the following :

```
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=drupal
MYSQL_USER=admin
MYSQL_PASSWORD=admin
MYSQL_PORT=3306
MYSQL_HOSTNAME=db
```

Base Dockerfile to start with:

```
FROM drupal:10.2.6

WORKDIR /opt/drupal/web/sites/default

RUN cp -p default.settings.php settings.php

RUN mkdir -m 777 files

# Sets drupal to look for settings.custom.php and use it:
RUN cat <<EOT  >> /opt/drupal/web/sites/default/settings.php
if (file_exists(\$app_root . '/' . \$site_path . '/settings.custom.php')) {
  include \$app_root . '/' . \$site_path . '/settings.custom.php';
}
EOT
```

Add something like this to the end of your `settings.php` file as part of your container build step:

```
<?php

$databases['default']['default'] = [
  'username' => getenv('MYSQL_USER'),
  'password' => getenv('MYSQL_PASSWORD'),
  'database' => getenv('MYSQL_DATABASE'),
  'host' => getenv('MYSQL_HOSTNAME'),
  'port' => getenv('MYSQL_PORT'),
  'namespace' => 'Drupal\\Core\\Database\\Driver\\mysql',
  'driver' => 'mysql',
];

?>
```

And that's it! Your shared

## 2. Headless
