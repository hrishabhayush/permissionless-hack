"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const dotenv_1 = require("dotenv");
const payments_1 = require("./routes/payments");
// Load environment variables
(0, dotenv_1.config)();
// Debug environment loading
console.log('🔍 Environment Debug:');
console.log(`📁 Current directory: ${process.cwd()}`);
console.log(`🌐 SERVER_PORT from process.env: ${process.env.SERVER_PORT}`);
console.log(`🏠 HOST from process.env: ${process.env.HOST}`);
console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV}`);
const fastify = (0, fastify_1.default)({
    logger: true
});
async function main() {
    try {
        // Register plugins
        await fastify.register(helmet_1.default);
        await fastify.register(cors_1.default, {
            origin: true // Configure properly for production
        });
        await fastify.register(rate_limit_1.default, {
            max: 100,
            timeWindow: '1 minute'
        });
        // Register routes
        await fastify.register(payments_1.paymentRoutes, { prefix: '/api/payments' });
        // Health check
        fastify.get('/health', async (request, reply) => {
            return { status: 'ok', timestamp: new Date().toISOString() };
        });
        // Start server
        const port = parseInt(process.env.SERVER_PORT || '3001');
        const host = process.env.HOST || '0.0.0.0';
        await fastify.listen({ port, host });
        console.log(`🚀 API Server running on http://${host}:${port}`);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=index.js.map