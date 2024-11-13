import { Module } from '@nestjs/common';
import { makeCounterProvider, PrometheusModule } from '@willsoto/nestjs-prometheus';
import { PrometheusOptions } from '@willsoto/nestjs-prometheus/dist/interfaces';

const prometheusConfig: PrometheusOptions = {
  path: '/metric',
  defaultMetrics: {
    enabled: true,
  },
  defaultLabels: {
    app: 'Microservice architecture',
  },
};

const HelloCounterProvider = makeCounterProvider({
  name: 'hello_counter',
  help: 'hello_counter',
});

const ByeCounterProvider = makeCounterProvider({
  name: 'bye_counter',
  help: 'bye_counter',
});

@Module({
  imports: [
    PrometheusModule.register(prometheusConfig),
  ],
  providers: [
    HelloCounterProvider,
    ByeCounterProvider,
  ],
  exports: [
    HelloCounterProvider,
    ByeCounterProvider,
  ]
})
export class MetricsModule {}
