# Курсовая работа — Сервис создания верифицируемых скриншотов веб-страниц

## План
 * [x] Документация
 * [x] Код
 * [x] Мониторинг
 * [x] Скрипты развертывания
 * [x] Настройка кк/s3/kafka
 * [x] Postman
 * [x] Авторизация
 * [x] Презентация

## Постановка задачи 
Верификация — это проверка подлинности данных. Цель верификации — подтвердить достоверность документа, 
личности пользователя или операции.
Верификация скриншота веб-страницы – Проверка соответствия изображения скриншоту сайта, сделанного сервисом.

## Диаграмма сценариев использования
Пользователь регистрируется на сайте, входит в личный кабинет по логину и паролю.
В личном кабинете может ввести url и запросить создание скриншота страницы.
На сайте видит список всех запросов на определенную страницу.

В деталях запроса страницы можно увидеть статусы обращений к сайту, полученные изображения после каждой
успешной обработки, даты обращений на сайт и процент соответствия скриншотов.
Скриншот страницы делается по запросу пользователя. Повторный скриншот только после окончания предыдущего запроса.
Пользователь может загрузить свой скриншот и запросить проверку его соответствия странице.

# Сервисы
## RequestsService
Принимает и проводит (оркестрирует) запросы на создание снимка страницы

### Методы 
 - /requestPageScreenshot

### Обработчики событий
 - createRequest()
 - rejectRequest()
 - consumerVerified()
 - consumerUnverified()
 - pageCaptureSuccess()
 - pageCaptureError()
 - metaSaved()

### Технологический стек
javascript, nestJS

### Базы данных
mongo

### CAP 
Availability + Partition tolerance

### Используемые паттерны
 - CQRS
 - Transaction outbox


## ConsumerService
Выполняет возможность выполнения запроса пользователем.
 - 3 параллельных запроса
 - 10 запросов в день

### Обработчики событий
- keepUserRequest()
- releaseUserRequest()

### Технологический стек
javascript, nestJS

### Базы данных
mongo

### CAP
Availability + Partition tolerance

### Используемые паттерны
- CQRS
- Event sourcing

## NotificationService
Отправляет email о готовности снимка страницы

### Методы

### Обработчики событий
- sendNotification()

### Технологический стек
javascript, nestJS

### Базы данных

### CAP
Availability + Partition tolerance

### Используемые паттерны

## PageCaptureService
Выполняет скриншот страницы

### Методы

### Обработчики событий
- takeCapture()
- deleteCapture()

### Технологический стек
javascript, nestJS

### Базы данных
s3 хранилище

### CAP
Availability + Partition tolerance

### Используемые паттерны
- Event driven design


## ScreenshotMetaService
Сервис управления метаданными снимков страниц

### Методы
- /capture/validate
- /capture/{id}

### Обработчики событий
- saveMeta()


### Технологический стек
javascript, nestJS

### Базы данных
mongo

### CAP
Availability + Partition tolerance

### Используемые паттерны
- Кеширование

# Проблемы
Не давать делать скриншоты слишком часто

Верифицировать на момент последнего события  

# Установка
```sh
# Запустить minikube
minikube start
# Установить nginx-ingress ./nginx

# Создать неймспейс и установить туда приложение
kubectl create namespace app
helm install -n app valid-page .

# Обновить пароль в cassnadra для пользователя bn_jaeger из секрета {{.Release.Name}}-cassandra
cqlsh -u cassandra -p cassandra
LIST USERS;
CREATE USER bn_jaeger WITH PASSWORD 'password' SUPERUSER;

# Настроить realm в keycloack
realm: valid-page
client: valid-page
client-scope с mapper Audience
Добавить созданный scope в client как deafult
Включить client authentication
Скопировать с вкладки credentials - secret
Скопировать серкреты в postman
# Добавить bucket и access key в minio

# Увеличить количество partitions в топиках kafka для реплицированных сервисов

# Добавить в графану дашборд
11159
```

# Ссылки
```
http://minio.arch.homework/
http://kafka-ui.arch.homework/
http://keycloak.arch.homework/
http://grafana.arch.homework/
http://jaeger.arch.homework/
http://prometheus.arch.homework/
http://arch.homework/
```
