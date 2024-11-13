import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
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


@Module({
  imports: [
    PrometheusModule.register(prometheusConfig),
  ],
  providers: [
  ],
  exports: [
  ]
})
export class MetricsModule {}
