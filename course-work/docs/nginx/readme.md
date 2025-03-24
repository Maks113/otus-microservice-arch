Использовать nginx ingress контроллер, установленный через хелм, а не встроенный в миникубик:
```
kubectl create namespace m \
 && helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx/ \
 && helm repo update \ 
 && helm install nginx ingress-nginx/ingress-nginx --namespace m -f nginx-ingress.yaml
```

https://kubernetes.github.io/ingress-nginx/user-guide/basic-usage/

необходимо в новых версиях nginx добавлять класс ингресса
`ingressClassName: nginx`
прикладывать к 2 дз урл для проверки: curl http://arch.homework/health или как указано в дз со *.
К 3 дз и далее дз прикладывать коллекцию postman и проверять ее работу через newman run имя_коллекции
прикладывать кроме команд разворачивания приложения, команду удаления)


прописать у себя в `hosts` хост `arch.homework` 127.0.0.1 ~~с адресом своего миникубика (`minikube ip`)~~, 
~~чтобы обращение было по имени хоста в запросах, а не айпи~~ 


```title=hosts
127.0.0.1 minio.arch.homework
127.0.0.1 kafka-ui.arch.homework
127.0.0.1 keycloak.arch.homework
127.0.0.1 grafana.arch.homework
127.0.0.1 jaeger.arch.homework
127.0.0.1 arch.homework
```