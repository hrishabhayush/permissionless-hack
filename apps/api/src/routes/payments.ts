import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import { z, ZodError } from 'zod';
import { Token2022MicropaymentDemo, PaymentResult, BalanceInfo } from '@referral/payments-sol';

// Validation schemas
const SendPaymentSchema = z.object({
  recipientAddress: z.string().min(32).max(44), // Solana address format
  amount: z.number().positive().max(1000), // Max 1000 PYUSD
  memo: z.string().optional()
});

const RequityPaymentSchema = z.object({
  requityId: z.number()
});

const CheckBalanceSchema = z.object({
  walletAddress: z.string().min(32).max(44)
});

// Hardcoded user mapping for demo purposes
const USER_MAPPINGS = new Map<number, {
  recipientAddress: string;
  amount: number;
  memo: string;
}>([
  [12345, {
    recipientAddress: "TRmpNVZEhNr5DawcGF4HfY8bppTazRwVj6zzL3ZZjNG",
    amount: 0.01,
    memo: "Referral payout for user 12345"
  }]
]);

export const paymentRoutes: FastifyPluginCallback = async (fastify: FastifyInstance) => {
  // Lazy initialization of payment service
  let paymentService: Token2022MicropaymentDemo | null = null;
  
  const getPaymentService = (): Token2022MicropaymentDemo => {
    if (!paymentService) {
      try {
        paymentService = new Token2022MicropaymentDemo();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        if (errorMessage.includes('Non-base58 character') || errorMessage.includes('your_private_key_here')) {
          throw new Error('Please configure your Solana wallet credentials in the .env file. Copy .env.example to .env and add your actual PRIVATE_KEY and WALLET_ADDRESS.');
        }
        
        if (errorMessage.includes('Environment variable') && errorMessage.includes('required')) {
          throw new Error('Missing required environment variables. Please copy .env.example to .env and configure your Solana wallet credentials.');
        }
        
        throw new Error(`Payment service initialization failed: ${errorMessage}`);
      }
    }
    return paymentService;
  };

  // Health check endpoint (doesn't require wallet configuration)
  fastify.get('/health', async (request, reply) => {
    return { 
      status: 'ok', 
      service: 'payments',
      timestamp: new Date().toISOString(),
      message: 'Payment service is ready. Configure .env file to enable payments.'
    };
  });

  // Requity user payment endpoint (called from mock store)
  fastify.post('/send', async (request, reply) => {
    try {
      // Check if request body exists
      if (!request.body) {
        reply.status(400).send({
          success: false,
          error: 'Request body is required',
          example: {
            requityId: 12345
          }
        });
        return;
      }
      
      const body = RequityPaymentSchema.parse(request.body);
      
      // Look up user mapping
      const userMapping = USER_MAPPINGS.get(body.requityId);
      if (!userMapping) {
        reply.status(404).send({
          success: false,
          error: `User mapping not found for requityId: ${body.requityId}`,
          availableUsers: Array.from(USER_MAPPINGS.keys())
        });
        return;
      }
      
      fastify.log.info(`Processing payment for requityId ${body.requityId}: ${userMapping.amount} PYUSD to ${userMapping.recipientAddress}`);
      
      const service = getPaymentService();
      const signature = await service.sendMicropayment(
        userMapping.recipientAddress, 
        userMapping.amount
      );
      
      const result: PaymentResult = {
        signature,
        amount: userMapping.amount,
        recipient: userMapping.recipientAddress,
        timestamp: Date.now()
      };
      
      reply.status(200).send({
        success: true,
        data: {
          ...result,
          requityId: body.requityId,
          memo: userMapping.memo
        }
      });
      
    } catch (error) {
      fastify.log.error('Requity payment error:', error);
      
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.') || 'root',
          message: err.message
        }));
        
        reply.status(400).send({
          success: false,
          error: 'Validation failed',
          details: validationErrors,
          example: {
            requityId: 12345
          }
        });
        return;
      }
      
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      });
    }
  });

  // Send micropayment endpoint (direct payment)
  fastify.post('/send-direct', async (request, reply) => {
    try {
      // Check if request body exists
      if (!request.body) {
        reply.status(400).send({
          success: false,
          error: 'Request body is required',
          example: {
            recipientAddress: "TRmpNVZEhNr5DawcGF4HfY8bppTazRwVj6zzL3ZZjNG",
            amount: 0.01,
            memo: "optional memo"
          }
        });
        return;
      }
      
      const body = SendPaymentSchema.parse(request.body);
      
      fastify.log.info(`Sending ${body.amount} PYUSD to ${body.recipientAddress}`);
      
      const service = getPaymentService();
      const signature = await service.sendMicropayment(
        body.recipientAddress, 
        body.amount
      );
      
      const result: PaymentResult = {
        signature,
        amount: body.amount,
        recipient: body.recipientAddress,
        timestamp: Date.now()
      };
      
      reply.status(200).send({
        success: true,
        data: result
      });
      
    } catch (error) {
      fastify.log.error('Payment error:', error);
      
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.') || 'root',
          message: err.message
        }));
        
        reply.status(400).send({
          success: false,
          error: 'Validation failed',
          details: validationErrors,
          example: {
            recipientAddress: "TRmpNVZEhNr5DawcGF4HfY8bppTazRwVj6zzL3ZZjNG",
            amount: 0.01,
            memo: "optional memo"
          }
        });
        return;
      }
      
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      });
    }
  });

  // Check balance endpoint
  fastify.get('/balance', async (request, reply) => {
    try {
      const service = getPaymentService();
      const balance: BalanceInfo = await service.checkBalances();
      
      reply.status(200).send({
        success: true,
        data: balance
      });
      
    } catch (error) {
      fastify.log.error('Balance check error:', error);
      
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Balance check failed'
      });
    }
  });

  // Estimate transaction cost endpoint
  fastify.get('/estimate-cost', async (request, reply) => {
    try {
      const service = getPaymentService();
      const costInfo = await service.checkTransactionCost();
      
      reply.status(200).send({
        success: true,
        data: costInfo
      });
      
    } catch (error) {
      fastify.log.error('Cost estimation error:', error);
      
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Cost estimation failed'
      });
    }
  });

  // Split payment endpoint (for referral attribution)
  fastify.post('/split-payment', async (request, reply) => {
    try {
      const SplitPaymentSchema = z.object({
        recipients: z.array(z.object({
          address: z.string().min(32).max(44),
          amount: z.number().positive(),
          role: z.enum(['creator', 'user', 'platform'])
        })).min(1).max(10),
        totalAmount: z.number().positive(),
        referralId: z.string().optional()
      });
      
      const body = SplitPaymentSchema.parse(request.body);
      
      // Validate total amounts match
      const sumAmounts = body.recipients.reduce((sum, r) => sum + r.amount, 0);
      if (Math.abs(sumAmounts - body.totalAmount) > 0.01) {
        return reply.status(400).send({
          success: false,
          error: 'Recipient amounts do not sum to total amount'
        });
      }
      
      fastify.log.info(`Processing split payment for ${body.recipients.length} recipients`);
      
      // Send payments to each recipient
      const results: PaymentResult[] = [];
      const service = getPaymentService();
      
      for (const recipient of body.recipients) {
        try {
          const signature = await service.sendMicropayment(
            recipient.address,
            recipient.amount
          );
          
          results.push({
            signature,
            amount: recipient.amount,
            recipient: recipient.address,
            timestamp: Date.now()
          });
          
          fastify.log.info(`Sent ${recipient.amount} PYUSD to ${recipient.role}: ${recipient.address}`);
          
        } catch (error) {
          fastify.log.error(`Failed to send to ${recipient.address}:`, error);
          // Continue with other recipients even if one fails
        }
      }
      
      reply.status(200).send({
        success: true,
        data: {
          results,
          totalSent: results.reduce((sum, r) => sum + r.amount, 0),
          successfulTransfers: results.length,
          totalRecipients: body.recipients.length
        }
      });
      
    } catch (error) {
      fastify.log.error('Split payment error:', error);
      
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.') || 'root',
          message: err.message
        }));
        
        reply.status(400).send({
          success: false,
          error: 'Validation failed',
          details: validationErrors,
          example: {
            recipients: [
              {
                address: "TRmpNVZEhNr5DawcGF4HfY8bppTazRwVj6zzL3ZZjNG",
                amount: 0.06,
                role: "creator"
              },
              {
                address: "user_wallet_address",
                amount: 0.02,
                role: "user"
              }
            ],
            totalAmount: 0.08,
            referralId: "optional_tracking_id"
          }
        });
        return;
      }
      
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Split payment failed'
      });
    }
  });
}; 