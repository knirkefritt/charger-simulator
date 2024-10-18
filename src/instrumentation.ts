import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { ConsoleMetricExporter } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { uniqueChargerId } from './constants';

// Import the Prometheus exporter
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';

// Initialize Prometheus exporter (no need to wrap in a PeriodicExportingMetricReader)
const prometheusExporter = new PrometheusExporter({
  port: 9464, // default Prometheus metrics port
}, () => {
  console.log(`Prometheus scrape endpoint: http://localhost:9464/metrics`);
});

// Configure the OpenTelemetry SDK
const sdk = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: `charger${uniqueChargerId}`,
    [ATTR_SERVICE_VERSION]: '1.0',
  }),
  traceExporter: new ConsoleSpanExporter(),
  // Remove PeriodicExportingMetricReader, and register the Prometheus exporter separately
  metricReader: prometheusExporter, // Directly use the PrometheusExporter here
});

console.log('Starting instrumentation');

// Start the OpenTelemetry SDK
sdk.start();
