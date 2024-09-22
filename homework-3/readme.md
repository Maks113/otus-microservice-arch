# Базовые сущности Кubernetes: ReplicaSet, Deployment, Service, Ingress

## Установка

```shell
kubectl create ns app-ns 
kubectl apply -n app-ns -f .
```

## Проверка

```shell
curl http://arch.homework/health
curl http://arch.homework/health
curl http://arch.homework/otusapp/aeugene/health
curl http://arch.homework/otusapp/maks.nikolaev/health
```

## Удаление

```shell
kubectl delete ns app-ns
```