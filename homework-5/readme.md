```sh
helm upgrade --install --namespace app --create-namespace hw5 .
```

```shell
helm upgrade --install ingress-nginx ingress-nginx \
  --repo https://kubernetes.github.io/ingress-nginx \
  --namespace ingress-nginx --create-namespace \
  --set controller.metrics.enabled=true \
  --set-string controller.podAnnotations."prometheus\.io/scrape"="true" \
  --set-string controller.podAnnotations."prometheus\.io/port"="10254"
```

```shell
https://medium.com/@cloudspinx/fix-error-metrics-api-not-available-in-kubernetes-aa10766e1c2f
https://stackoverflow.com/questions/57137683/how-to-troubleshoot-metrics-server-on-kubeadm/57199534
https://dev.to/docker/enable-kubernetes-metrics-server-on-docker-desktop-5434
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```