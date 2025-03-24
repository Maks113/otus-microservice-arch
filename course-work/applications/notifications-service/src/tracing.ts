import { Span } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { CompositePropagator, W3CBaggagePropagator, W3CTraceContextPropagator } from '@opentelemetry/core';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { MessageInfo } from '@opentelemetry/instrumentation-kafkajs';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger';
import { Resource } from '@opentelemetry/resources';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { IncomingMessage } from 'http';
import { ClientRequest } from 'node:http';
import * as process from 'process';

const collectorOptions = {
  url: process.env.OTEL_TRACE_COLLECTOR_URL ?? '',
};
const traceExporter = new OTLPTraceExporter(collectorOptions);
const logExporter = new OTLPLogExporter(collectorOptions);

const otelSDK = new NodeSDK({
  metricReader: new PrometheusExporter({
    port: 8081,
  }),
  resource: new Resource({
    [ATTR_SERVICE_NAME]: `notifications-service`,
  }),
  spanProcessors: [new BatchSpanProcessor(traceExporter)],
  logRecordProcessors: [new BatchLogRecordProcessor(logExporter)],
  contextManager: new AsyncLocalStorageContextManager(),
  textMapPropagator: new CompositePropagator({
    propagators: [
      new JaegerPropagator(),
      new W3CTraceContextPropagator(),
      new W3CBaggagePropagator(),
    ],
  }),
  instrumentations: [
    new PinoInstrumentation({
      logKeys: {
        traceId: 'traceId',
        spanId: 'spanId',
        traceFlags: 'traceFlags',
      },
    }),
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-mongoose': { enabled: false },
      '@opentelemetry/instrumentation-mongodb': { enabled: false },
      '@opentelemetry/instrumentation-net': { enabled: false },
      '@opentelemetry/instrumentation-dns': { enabled: false },

      '@opentelemetry/instrumentation-kafkajs': { enabled: true },
      '@opentelemetry/instrumentation-nestjs-core': { enabled: true },
      '@opentelemetry/instrumentation-http': {
        enabled: true,
        requestHook: (span, request: ClientRequest | IncomingMessage | any) => {
          span.updateName(`${request.method} ${request.path ?? ''}`)
          span.setAttribute('request.uuid', request.id)
          span.setAttribute('user_agent.original', request.headers['user-agent'])
          span.setAttribute('server.address', request.host)
        },
      },
    }),
  ],
});

export default otelSDK;

// You can also use the shutdown method to gracefully shut down the SDK before process shutdown
// or on some operating system signal.
process.on('SIGTERM', () => {
  otelSDK
    .shutdown()
    .then(
      () => console.log('SDK shut down successfully'),
      err => console.log('Error shutting down SDK', err),
    )
    .finally(() => process.exit(0));
});