const {
    trace: trace
} = require("@opentelemetry/api");

const {
    OTLPTraceExporter: OTLPTraceExporter
} = require("@opentelemetry/exporter-trace-otlp-http");

const {
    BasicTracerProvider: BasicTracerProvider,
    SimpleSpanProcessor: SimpleSpanProcessor
} = require("@opentelemetry/sdk-trace-base");

const collectorOptions = {
    url: "http://localhost:3695/otel"
};

const provider = new BasicTracerProvider();
const exporter = new OTLPTraceExporter(collectorOptions);
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
trace.setGlobalTracerProvider(provider);
provider.register();

function captureAndSend(...args) {
    const content = args.map(arg => JSON.stringify(arg));

    fetch("http://localhost:3695", {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            log: content
        })
    });
}

const {
    trace: trace
} = require("@opentelemetry/api");

const {
    OTLPTraceExporter: OTLPTraceExporter
} = require("@opentelemetry/exporter-trace-otlp-http");

const {
    BasicTracerProvider: BasicTracerProvider,
    SimpleSpanProcessor: SimpleSpanProcessor
} = require("@opentelemetry/sdk-trace-base");

const collectorOptions = {
    url: "http://localhost:3695/otel"
};

const provider = new BasicTracerProvider();
const exporter = new OTLPTraceExporter(collectorOptions);
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
trace.setGlobalTracerProvider(provider);
provider.register();

function captureAndSend(...args) {
    const content = args.map(arg => JSON.stringify(arg));

    fetch("http://localhost:3695", {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            log: content
        })
    });
}

console.log('Test log 1');
captureAndSend('Test log 1');
captureAndSend('Test log 1');
console.log('Test log 2');
captureAndSend('Test log 2');
captureAndSend('Test log 2');
function testFunction() {
    console.log('Test log 3', 'hehe sneaky');
    captureAndSend('Test log 3', 'hehe sneaky');
    captureAndSend('Test log 3', 'hehe sneaky');
}
const myArr = [5, 4, 3, 2, 1];
console.error(
    'Will it catch this?');
console.log(myArr);
captureAndSend(myArr);
captureAndSend(myArr);
const a = 5;
const b = 3;
console.log(a + b);
captureAndSend(a + b);
captureAndSend(a + b);