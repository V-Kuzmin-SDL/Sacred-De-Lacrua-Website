



## 🔒 Улучшена ли безопасность?

**Пока нет, безопасность чата требует доработки.** В текущей реализации есть уязвимости:

| Проблема | Риск | Решение |
|----------|------|---------|
| Пароль хранится в открытом виде в `chat_login.php` | Любой, кто получит доступ к файлу, узнает пароль. | Вынести пароль в переменную окружения или файл вне `html`-папки, использовать `password_hash()` и `password_verify()`. |
| Нет защиты от XSS (в `chat_api.php` не экранируется вывод) | Злоумышленник может внедрить скрипт в сообщение, который украдёт сессии. | Применять `htmlspecialchars()` ко всем выводимым данным из БД. |
| Нет ограничения частоты сообщений (rate limiting) | Спам, флуд, возможная DoS-атака. | Проверять время последнего сообщения по сессии или IP, блокировать на 5–10 секунд. |
| Нет CSRF-защиты | Злоумышленник может отправить сообщение от имени пользователя через внешний сайт. | Добавить CSRF-токен в форму и проверять его. |
| Отсутствует валидация ввода | Возможна отправка пустых или слишком длинных сообщений. | Обрезать пробелы, ограничить длину (например, 500 символов). |
| SQLite-файл доступен для чтения извне (если веб-сервер не настроен) | Потенциально кто-то может скачать `chat.db` и прочитать сообщения. | В Nginx добавить запрет доступа к `*.db` файлам. |
| Нет защиты от подбора пароля | Атакующий может перебирать пароль без блокировки. | Добавить задержку после неудачных попыток, ограничить количество попыток. |

---

## 🛠️ Что я рекомендую сделать для улучшения безопасности (конкретные шаги)

### 1. Вынести пароль из кода в переменную окружения
Создайте файл `/etc/nginx/chat_secret.conf` или используйте `.env` (потребуется библиотека `vlucas/phpdotenv`).  
Проще: установите переменную окружения в конфиге PHP-FPM или в файле `/etc/php/8.3/fpm/conf.d/99-custom.ini`:
```
env[CHAT_PASSWORD] = 'secret123'
```
В `chat_login.php` читать так:
```php
$correct_password = getenv('CHAT_PASSWORD') ?: 'secret123';
```

### 2. Экранирование вывода в `chat_api.php`
Замените:
```php
while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
    $messages[] = [
        'username' => htmlspecialchars($row['username']),
        'message' => htmlspecialchars($row['message']),
        'created_at' => $row['created_at']
    ];
}
```

### 3. Ограничение частоты сообщений (простая реализация)
В `chat_room.php` перед вставкой сообщения:
```php
session_start();
$last = $_SESSION['last_message_time'] ?? 0;
if (time() - $last < 5) {
    // флуд, не сохраняем
    header('Location: chat_room.php?error=flood');
    exit;
}
$_SESSION['last_message_time'] = time();
```

### 4. Запрет доступа к `chat.db` через Nginx
Добавьте в конфиг сайта:
```nginx
location ~ \.db$ {
    deny all;
    return 403;
}
```

### 5. CSRF-токен (базовый)
В `chat_room.php` в форму добавьте:
```php
session_start();
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
```
В форме:
```html
<input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
```
При обработке POST проверяйте.

---

## 📌 Что уже сделано из безопасности?

- Пароль не передаётся в URL.
- Сессии используются для авторизации.
- `chat_login.php` не сохраняет пароль в логах.
- SQLite-запросы используют подготовленные выражения (защита от SQL-инъекций).

---

Мы сделаем чат безопасным. Ниже — пошаговая инструкция с готовыми файлами.

## 🔐 Улучшенная безопасность чата

### 1. Создадим конфиг с хешем пароля (вне папки сайта)

Подключитесь к серверу по SSH:

```bash
ssh root@93.88.203.89 -p 62965
```

Создайте каталог для конфигов (если его нет):

```bash
mkdir -p /var/www/private
```

Сгенерируйте хеш для пароля (например, для `secret123`):

```bash
php -r "echo password_hash('secret123', PASSWORD_DEFAULT);"
```

Скопируйте полученный хеш (начинается с `$2y$10$...`). Теперь создайте файл:

```bash
nano /var/www/private/chat_config.php
```

Вставьте содержимое:

```php
<?php
// Храним только хеш пароля
define('CHAT_PASSWORD_HASH', '$2y$10$...'); // замените на ваш хеш
```

Сохраните (Ctrl+O, Enter, Ctrl+X). Установите правильные права:

```bash
chmod 600 /var/www/private/chat_config.php
```

### 2. Обновим `chat_login.php`

```bash
nano /var/www/html/chat_login.php
```

Замените содержимое на:

```php
<?php
session_start();
require_once '/var/www/private/chat_config.php';

// Перенаправляем, если уже авторизован
if (isset($_SESSION['chat_auth']) && $_SESSION['chat_auth'] === true) {
    header('Location: chat_room.php');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $password = $_POST['password'] ?? '';
    if (password_verify($password, CHAT_PASSWORD_HASH)) {
        $_SESSION['chat_auth'] = true;
        // регенерация ID сессии для защиты от фиксации
        session_regenerate_id(true);
        header('Location: chat_room.php');
        exit;
    } else {
        $error = 'Неверный пароль';
        // Задержка для защиты от подбора
        sleep(1);
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Вход в чат</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: sans-serif;
            max-width: 400px;
            margin: 50px auto;
            background: #0b0a0a;
            color: #e8e3db;
        }
        input, button {
            padding: 10px;
            width: 100%;
            margin: 5px 0;
            border-radius: 8px;
            border: 1px solid #b8a99a;
            background: rgba(0,0,0,0.3);
            color: #fff;
        }
        button {
            background: #b8a99a;
            color: #0b0a0a;
            cursor: pointer;
            font-weight: bold;
        }
        .error { color: #ff8888; }
    </style>
</head>
<body>
    <h2>Закрытый чат</h2>
    <?php if ($error): ?>
        <p class="error"><?= htmlspecialchars($error) ?></p>
    <?php endif; ?>
    <form method="post">
        <input type="password" name="password" placeholder="Введите пароль" required autofocus>
        <button type="submit">Войти</button>
    </form>
</body>
</html>
```

### 3. Обновим `chat_room.php` (с CSRF, rate limiting, экранированием)

```bash
nano /var/www/html/chat_room.php
```

Замените содержимое:

```php
<?php
session_start();
if (!isset($_SESSION['chat_auth']) || $_SESSION['chat_auth'] !== true) {
    header('Location: chat_login.php');
    exit;
}

// CSRF токен
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Обработка отправки сообщения
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['message'])) {
    // Проверка CSRF
    if (!isset($_POST['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
        $error = 'Ошибка безопасности. Обновите страницу.';
    } else {
        // Rate limiting (не чаще 1 сообщения в 5 секунд)
        $last = $_SESSION['last_message_time'] ?? 0;
        if (time() - $last < 5) {
            $error = 'Пожалуйста, не флудите. Подождите немного.';
        } else {
            $username = trim($_POST['username'] ?? '');
            $message = trim($_POST['message'] ?? '');
            if (strlen($username) > 50) $username = substr($username, 0, 50);
            if (strlen($message) > 1000) $message = substr($message, 0, 1000);
            if ($username === '') $username = 'Гость';
            if ($message !== '') {
                $db = new SQLite3('/var/www/html/chat.db');
                $stmt = $db->prepare('INSERT INTO messages (username, message) VALUES (:username, :message)');
                $stmt->bindValue(':username', $username, SQLITE3_TEXT);
                $stmt->bindValue(':message', $message, SQLITE3_TEXT);
                $stmt->execute();
                $db->close();
                $_SESSION['last_message_time'] = time();
                // Обновляем CSRF токен после успешной отправки
                $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
            }
        }
    }
    // Перенаправляем, чтобы избежать повторной отправки
    header('Location: chat_room.php');
    exit;
}
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Чат</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: sans-serif;
            max-width: 800px;
            margin: 20px auto;
            background: #0b0a0a;
            color: #e8e3db;
        }
        #messages {
            border: 1px solid #b8a99a;
            height: 400px;
            overflow-y: auto;
            padding: 10px;
            margin-bottom: 10px;
            background: rgba(0,0,0,0.3);
            border-radius: 8px;
        }
        .msg {
            margin: 5px 0;
            border-bottom: 1px solid #2a2a2a;
            padding: 5px;
        }
        .name {
            font-weight: bold;
            color: #d4a373;
        }
        .time {
            font-size: 0.7em;
            color: #888;
            margin-left: 10px;
        }
        form {
            display: flex;
            gap: 5px;
            flex-wrap: wrap;
        }
        input, button {
            padding: 8px;
            border-radius: 20px;
            border: 1px solid #b8a99a;
            background: rgba(0,0,0,0.5);
            color: #fff;
        }
        #username { width: 150px; }
        #message { flex: 1; }
        button {
            background: #b8a99a;
            color: #0b0a0a;
            cursor: pointer;
        }
        .error { color: #ff8888; text-align: center; margin-bottom: 10px; }
        a { color: #b8a99a; }
    </style>
    <script>
        let csrfToken = '<?= $_SESSION['csrf_token'] ?>';
        function loadMessages() {
            fetch('chat_api.php?t=' + Date.now())
                .then(response => response.json())
                .then(data => {
                    const container = document.getElementById('messages');
                    container.innerHTML = '';
                    data.forEach(msg => {
                        const div = document.createElement('div');
                        div.className = 'msg';
                        div.innerHTML = `<span class="name">${escapeHtml(msg.username)}</span>
                                         <span class="time">${msg.created_at}</span><br>
                                         ${escapeHtml(msg.message)}`;
                        container.appendChild(div);
                    });
                    container.scrollTop = container.scrollHeight;
                })
                .catch(err => console.error('Ошибка загрузки:', err));
        }
        function escapeHtml(str) {
            return str.replace(/[&<>]/g, function(m) {
                if (m === '&') return '&amp;';
                if (m === '<') return '&lt;';
                if (m === '>') return '&gt;';
                return m;
            });
        }
        setInterval(loadMessages, 3000);
        window.onload = loadMessages;
    </script>
</head>
<body>
    <h2>Добро пожаловать в чат</h2>
    <?php if ($error): ?>
        <div class="error"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>
    <div id="messages"></div>
    <form method="post">
        <input type="text" name="username" id="username" placeholder="Ваше имя" value="Гость">
        <input type="text" name="message" id="message" placeholder="Сообщение..." required autofocus>
        <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
        <button type="submit">Отправить</button>
    </form>
    <p><a href="chat_logout.php">Выйти</a></p>
</body>
</html>
```

### 4. Обновим `chat_api.php` (экранирование вывода)

```bash
nano /var/www/html/chat_api.php
```

Замените содержимое:

```php
<?php
session_start();
if (!isset($_SESSION['chat_auth']) || $_SESSION['chat_auth'] !== true) {
    http_response_code(403);
    exit('Forbidden');
}

$db = new SQLite3('/var/www/html/chat.db');
$results = $db->query('SELECT username, message, created_at FROM messages ORDER BY id DESC LIMIT 100');
$messages = [];
while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
    $messages[] = [
        'username' => htmlspecialchars($row['username'], ENT_QUOTES, 'UTF-8'),
        'message' => htmlspecialchars($row['message'], ENT_QUOTES, 'UTF-8'),
        'created_at' => htmlspecialchars($row['created_at'])
    ];
}
header('Content-Type: application/json');
echo json_encode(array_reverse($messages));
$db->close();
```

### 5. Обновим `chat_logout.php`

```bash
nano /var/www/html/chat_logout.php
```

Содержимое:

```php
<?php
session_start();
session_destroy();
header('Location: chat_login.php');
exit;
```

### 6. Запретим доступ к `.db` через Nginx

Откройте конфиг вашего сайта (например, `/etc/nginx/sites-available/sdltech.tech` или `default`):

```bash
nano /etc/nginx/sites-available/sdltech.tech
```

Добавьте внутри блока `server`:

```nginx
location ~ \.db$ {
    deny all;
    return 403;
}
```

Проверьте и перезагрузите Nginx:

```bash
nginx -t
systemctl reload nginx
```

### 7. Установим правильные права на файл БД

```bash
chown www-data:www-data /var/www/html/chat.db
chmod 660 /var/www/html/chat.db
```

### 8. Проверка

Введите пароль `secret123` (если не меняли). Чат будет безопасным:

- Пароль хранится в виде хеша.
- Защита от XSS (экранирование в API и на клиенте).
- Rate limiting (5 секунд между сообщениями).
- CSRF-токен.
- Нет прямого доступа к файлу БД.
- Защита от подбора пароля (задержка).

---
