import { Counter, collectDefaultMetrics, Registry } from "prom-client";

const registry = new Registry();
collectDefaultMetrics({ register: registry });
const requestCounter = new Counter({
	name: "http_requests_total",
	help: "Total HTTP requests",
	labelNames: ["method", "route", "status"],
	registers: [registry],
});

export { registry, requestCounter };
