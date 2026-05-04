import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

export function initOtel(): void {
  const provider = new WebTracerProvider({
    resource: resourceFromAttributes({ [ATTR_SERVICE_NAME]: 'transport-backoffice' }),
    spanProcessors: [
      new BatchSpanProcessor(
        new OTLPTraceExporter({ url: '/v1/traces' })
      ),
    ],
  });

  provider.register({
    contextManager: new ZoneContextManager(),
    propagator: new W3CTraceContextPropagator(),
  });

  registerInstrumentations({
    instrumentations: [
      new XMLHttpRequestInstrumentation({
        propagateTraceHeaderCorsUrls: [/.*/],
        clearTimingResources: true,
      }),
      new DocumentLoadInstrumentation(),
    ],
  });
}
