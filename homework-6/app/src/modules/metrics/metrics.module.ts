import { Module } from '@nestjs/common';
import {
  makeCounterProvider,
  makeHistogramProvider,
  makeSummaryProvider,
  PrometheusModule,
} from '@willsoto/nestjs-prometheus';
import { PrometheusOptions } from '@willsoto/nestjs-prometheus/dist/interfaces';

const prometheusConfig: PrometheusOptions = {
  path: '/metrics',
  defaultMetrics: {
    enabled: true,
  },
  defaultLabels: {
    app: 'Microservice architecture',
  },
};

const LatencyHistogramProvider = makeHistogramProvider({
  name: 'latency_histogram',
  help: 'response time',
});

const RPSCounterProvider = makeCounterProvider({
  name: 'request_count',
  help: 'Request count',
});

const ErrorRateProvider = makeCounterProvider({
  name: 'error_count',
  help: 'Error count',
});

@Module({
  imports: [
    PrometheusModule.register(prometheusConfig),
  ],
  providers: [
    LatencyHistogramProvider,
    RPSCounterProvider,
    ErrorRateProvider,
  ],
  exports: [
    LatencyHistogramProvider,
    RPSCounterProvider,
    ErrorRateProvider,
  ]
})
export class MetricsModule {}
