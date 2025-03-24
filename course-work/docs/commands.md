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