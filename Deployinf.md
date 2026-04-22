Вот полная инструкция по развертыванию вашего проекта **Sacred De Lacrua** на VPS сервере с использованием GitHub. Инструкция подходит для Ubuntu 22.04/24.04, Nginx, PHP-FPM, SQLite.

---

## 🚀 Полная инструкция по развертыванию проекта на VPS через GitHub

### 1. Подготовка сервера

Подключитесь к серверу по SSH:

```bash
ssh root@ваш_IP_сервера -p ваш_SSH_порт
```

Обновите систему и установите необходимые пакеты:

```bash
apt update && apt upgrade -y
apt install -y nginx php-fpm php-sqlite3 sqlite3 git curl wget ufw
```

### 2. Клонирование репозитория с GitHub

Перейдите в веб-директорию:

```bash
cd /var/www
```

Склонируйте репозиторий (замените URL на ваш):

```bash
git clone https://github.com/V-Kuzmin-SDL/Sacred-De-Lacrua-Website.git html
```

> Если репозиторий приватный, используйте SSH-ключ или Personal Access Token.

### 3. Настройка прав доступа

```bash
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html
```

### 4. Создание базы данных для чата

```bash
cd /var/www/html
sqlite3 chat.db <<EOF
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
EOF
chown www-data:www-data chat.db
chmod 660 chat.db
```

### 5. Настройка безопасности чата (хеш пароля)

Создайте директорию для приватных конфигов (вне веб-папки):

```bash
mkdir -p /var/www/private
```

Сгенерируйте хеш для пароля (замените `ваш_пароль` на реальный):

```bash
php -r "echo password_hash('ваш_пароль', PASSWORD_DEFAULT);"
```

Скопируйте полученный хеш. Создайте файл конфигурации:

```bash
nano /var/www/private/chat_config.php
```

Вставьте содержимое (замените хеш):

```php
<?php
define('CHAT_PASSWORD_HASH', '$2y$10$...'); // вставьте ваш хеш
```

Сохраните и установите права:

```bash
chmod 600 /var/www/private/chat_config.php
chown www-data:www-data /var/www/private/chat_config.php
```

### 6. Настройка Nginx

Создайте конфигурационный файл для вашего домена (или используйте `default`):

```bash
nano /etc/nginx/sites-available/sdltech.tech
```

Вставьте следующую конфигурацию (замените `sdltech.tech` на ваш домен или оставьте `_` для IP):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name sdltech.tech www.sdltech.tech;

    root /var/www/html;
    index index.html index.php;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
    }

    location ~ \.db$ {
        deny all;
        return 403;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

Активируйте сайт и перезагрузите Nginx:

```bash
ln -s /etc/nginx/sites-available/sdltech.tech /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### 7. Настройка PHP-FPM

Убедитесь, что PHP-FPM запущен и использует правильный сокет:

```bash
systemctl enable php8.3-fpm
systemctl start php8.3-fpm
```

Если версия PHP другая, замените `8.3` на вашу.

### 8. Открытие портов в фаерволе

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 9. (Опционально) Настройка проброса портов (если сервер за NAT)

Если ваш сервер имеет внутренний IP (например, `192.168.x.x`) и публичный IP на шлюзе, попросите администратора хостера или настройте в панели управления проброс портов **80** и **443** на внутренний IP вашей ВМ.

### 10. (Опционально) Получение SSL-сертификата Let's Encrypt

Установите Certbot:

```bash
apt install certbot python3-certbot-nginx -y
```

Получите сертификат:

```bash
certbot --nginx -d sdltech.tech -d www.sdltech.tech
```

Следуйте инструкциям. Выберите перенаправление HTTP → HTTPS.

### 11. Проверка работоспособности

Откройте браузер и перейдите по адресу:

- `http://ваш_IP_сервера`
- `http://sdltech.tech` (если домен настроен)

Страница должна загрузиться, стили музыки должны подгружаться динамически. Чат доступен по `/chat_login.php`.

### 12. Обновление проекта из GitHub

При последующих изменениях в репозитории, зайдите на сервер и выполните:

```bash
cd /var/www/html
git pull origin main
```

Если изменились права или структура, возможно, потребуется перезагрузить Nginx или очистить кэш браузера.

---

## 🔁 Автоматизация обновлений (webhook)

Чтобы при каждом push на GitHub сайт автоматически обновлялся, можно настроить webhook:

1. На сервере создайте скрипт `/var/www/deploy.sh`:

```bash
#!/bin/bash
cd /var/www/html && git pull origin main
```

2. Сделайте его исполняемым: `chmod +x /var/www/deploy.sh`

3. Установите простой webhook-сервер (например, через PHP-скрипт) или используйте сервис типа `webhook` (https://github.com/adnanh/webhook).

Проще всего настроить GitHub Actions для деплоя по SSH, но это отдельная тема.

---

## 📌 Резюме команд для быстрого развёртывания (шпаргалка)

```bash
# Подключение
ssh root@93.88.203.89 -p 62965

# Установка ПО
apt update && apt install -y nginx php-fpm php-sqlite3 sqlite3 git ufw

# Клонирование
cd /var/www && git clone https://github.com/V-Kuzmin-SDL/Sacred-De-Lacrua-Website.git html

# База данных
cd /var/www/html && sqlite3 chat.db "CREATE TABLE messages (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, message TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);"

# Права
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html && chmod 660 /var/www/html/chat.db

# Конфиг пароля
mkdir /var/www/private
php -r "echo password_hash('secret123', PASSWORD_DEFAULT);"  # запомнить хеш
nano /var/www/private/chat_config.php  # вставить хеш
chmod 600 /var/www/private/chat_config.php && chown www-data:www-data /var/www/private/chat_config.php

# Nginx config (пример)
cat > /etc/nginx/sites-available/sdltech.tech <<EOF
server {
    listen 80;
    server_name _;
    root /var/www/html;
    index index.html index.php;
    location / { try_files \$uri \$uri/ =404; }
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
    }
    location ~ \.db$ { deny all; }
}
EOF
ln -s /etc/nginx/sites-available/sdltech.tech /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Фаервол
ufw allow 22,80,443/tcp && ufw enable
```

После этого сайт будет доступен по IP. Если домен уже настроен, добавьте `server_name` в конфиг и получите SSL.

---

Если на каком-то этапе возникнут ошибки — проверьте логи:

- Nginx: `tail -f /var/log/nginx/error.log`
- PHP-FPM: `tail -f /var/log/php8.3-fpm.log`

Успешного деплоя! 🚀