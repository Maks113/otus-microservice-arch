[ingress for docker-desktop kubernetes](https://www.blueshoe.io/blog/docker-desktop-and-kubernetes/)

```sh
helm dependencies update
helm dependencies build

kubectl create ns app
helm install -n app hw4 .
```

[Swagger](http://arch.homework/api)

```sh
helm upgrade --install ingress-nginx ingress-nginx \
  --repo https://kubernetes.github.io/ingress-nginx \
  --namespace ingress-nginx --create-namespace
```