```sh
minikube tunnel

minikube docker-env --shell powershell
minikube -p minikube docker-env --shell powershell | Invoke-Expression

minikube docker-env --shell bash
eval $(minikube -p minikube docker-env)

minikube image load <image name>
```

```bash
helm dependencies update
helm dependencies build
```

```ps
netstat -aon | findstr ":80" | findstr "LISTENING"
```

```sh
minikube service list
docker port minikube
```

```sh
docker build -t maks113/valid-page-consumer-service:1.0.3 ./consumer-service/
docker build -t maks113/valid-page-notification-service:1.0.3 ./notifications-service/
docker build -t maks113/valid-page-page-capture-service:1.0.2 ./page-capture-service/
docker build -t maks113/valid-screenshot-meta-service:1.0.13 ./screenshot-meta-service/
docker build -t maks113/valid-page-screenshot-requests-service:1.0.7 ./screenshot-requests-service/

minikube image load maks113/valid-page-consumer-service:1.0.3
minikube image load maks113/valid-page-notification-service:1.0.3
minikube image load maks113/valid-page-page-capture-service:1.0.2
minikube image load maks113/valid-screenshot-meta-service:1.0.13
minikube image load maks113/valid-page-screenshot-requests-service:1.0.7
```

```sh
helm upgrade --install -n app --create-namespace valid-page ../valid-page-chart
```