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
  solRequityId: z.string().min(32).max(44).optional(),
  solSourcesAddresses: z.array(z.string().min(32).max(44)).min(1).max(10).optional(),
  ethRequityId: z.string().startsWith('0x').length(42).optional(),
  ethSourcesAddresses: z.array(z.string().startsWith('0x').length(42)).min(1).max(10).optional()
}).refine(data => 
  (data.solRequityId && data.solSourcesAddresses) || (data.ethRequityId && data.ethSourcesAddresses),
  {
    message: "Either Solana (solRequityId, solSourcesAddresses) or Ethereum (ethRequityId, ethSourcesAddresses) fields must be provided.",
    path: ["requityPayment"],
  }
);

const CheckBalanceSchema = z.object({
  walletAddress: z.string().min(32).max(44)
});

// Fixed amount to send to each source address (in PYUSD)
const PAYOUT_AMOUNT_PER_SOURCE = 0.01;

export const paymentRoutes: FastifyPluginCallback = async (fastify: FastifyInstance) => {
  // Lazy initialization of payment service
  let paymentService: Token2022MicropaymentDemo | null = null;
  
  const getPaymentService = (): Token2022MicropaymentDemo => {
    if (!paymentService) {
      try {
        paymentService = new Token2022MicropaymentDemo(true);
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
            solRequityId: "user_solana_address",
            solSourcesAddresses: ["3QzXMwX4b6hwuNMKLjyZJtK4W5JqxoojgSKDX9Gqot3Y"],
            ethRequityId: "0x...",
            ethSourcesAddresses: ["0x..."]
          }
        });
        return;
      }
      
      const body = RequityPaymentSchema.parse(request.body);
      
      // Transaction requested log
      console.log('Transaction requested:');
      if (body.solRequityId) {
        console.log(` solRequityId: ${body.solRequityId}`);
        console.log(` solWallets: ${body.solSourcesAddresses?.join(', ')}`);
      }
      if (body.ethRequityId) {
        console.log(` ethRequityId: ${body.ethRequityId}`);
        console.log(` ethWallets: ${body.ethSourcesAddresses?.join(', ')}`);
      }
      
      const service = getPaymentService();
      const results: PaymentResult[] = [];
      
      // Combine all Solana recipients and remove duplicates
      const allSolanaRecipients = new Set<string>();
      if (body.solRequityId) {
        allSolanaRecipients.add(body.solRequityId);
      }
      body.solSourcesAddresses?.forEach(address => allSolanaRecipients.add(address));

      // Send the same amount to all unique Solana recipients
      for (const recipientAddress of allSolanaRecipients) {
        try {
          const signature = await service.sendMicropayment(
            recipientAddress,
            PAYOUT_AMOUNT_PER_SOURCE,
            "[requity transfer]"
          );

          const result: PaymentResult = {
            signature,
            amount: PAYOUT_AMOUNT_PER_SOURCE,
            recipient: recipientAddress,
            timestamp: Date.now()
          };

          results.push(result);

          // Status of solana transaction
          console.log('Status of solana transaction');
          console.log(`Transaction passed for ${recipientAddress}: ${signature ? 'SUCCESS' : 'FAILED'}`);

        } catch (error) {
          // Status of solana transaction
          console.log('Status of solana transaction');
          console.log(`Transaction passed for ${recipientAddress}: FAILED`);
          // Continue with other recipients even if one fails
        }
      }

      if (body.ethSourcesAddresses) {
        // TODO: Implement Ethereum payment logic
        console.log(`Processing ${body.ethSourcesAddresses.length} Ethereum addresses (payment logic not implemented).`);
      }
      
      const totalSent = results.reduce((sum, r) => sum + r.amount, 0);
      
      reply.status(200).send({
        success: true,
        data: {
          requityId: body.solRequityId || body.ethRequityId,
          results,
          totalSent,
          successfulTransfers: results.length,
          totalSources: allSolanaRecipients.size + (body.ethSourcesAddresses?.length || 0),
          amountPerSource: PAYOUT_AMOUNT_PER_SOURCE
        }
      });
      
    } catch (error) {
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
            solRequityId: "user_solana_address",
            solSourcesAddresses: ["3QzXMwX4b6hwuNMKLjyZJtK4W5JqxoojgSKDX9Gqot3Y"],
            ethRequityId: "0x...",
            ethSourcesAddresses: ["0x..."]
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
          
        } catch (error) {
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