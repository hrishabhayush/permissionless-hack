import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { config } from 'dotenv';
import { paymentRoutes } from './routes/payments';

// Load environment variables
config();

// Debug environment loading
console.log('🔍 Environment Debug:');
console.log(`📁 Current directory: ${process.cwd()}`);
console.log(`🌐 SERVER_PORT from process.env: ${process.env.SERVER_PORT}`);
console.log(`🏠 HOST from process.env: ${process.env.HOST}`);
console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV}`);

const fastify = Fastify({
  logger: true
});

async function main() {
  try {
    // Register plugins
    await fastify.register(helmet, {
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: false,
      contentSecurityPolicy: false
    });
    await fastify.register(cors, {
      origin: true, // Allow all origins for demo
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
      credentials: false // Set to false for broader compatibility
    });
    await fastify.register(rateLimit, {
      max: 100,
      timeWindow: '1 minute'
    });

    // Register routes
    await fastify.register(paymentRoutes, { prefix: '/api/payments' });

    // Health check
    fastify.get('/health', async (request, reply) => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // Start server
    const port = parseInt(process.env.SERVER_PORT || '3001');
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    console.log(`🚀 API Server running on http://${host}:${port}`);
    
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main(); 