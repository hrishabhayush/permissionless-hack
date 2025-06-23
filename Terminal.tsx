import React from "react";
import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/magicui/terminal";

export function WebsiteAttributionTerminal() {
  return (
    <div className="w-full min-h-screen pt-32 pb-16">
      {/* Main content container with top padding for navbar space */}
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Title section - moved down from top */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Agent Automation for wallet and revenue share
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Watch the Website Attribution Agent automatically process conversions and distribute real Supra token payouts in real-time
          </p>
        </div>

        {/* Terminal container with proper spacing */}
        <div className="w-full max-w-5xl mx-auto">
          <Terminal className="min-h-[600px] p-6">
            <TypingAnimation className="text-green-400 font-mono">
              $ agent start --mode=revenue-share
            </TypingAnimation>

            <AnimatedSpan delay={1000} className="text-blue-400 block mt-2">
              <span>🚀 Initializing Website Attribution Agent...</span>
            </AnimatedSpan>

            <AnimatedSpan delay={1500} className="text-green-400 block mt-1">
              <span>✅ Connected to Supra Network</span>
            </AnimatedSpan>

            <AnimatedSpan delay={2000} className="text-green-400 block mt-1">
              <span>✅ Wallet loaded and ready</span>
            </AnimatedSpan>

            <AnimatedSpan delay={2500} className="text-yellow-400 block mt-2">
              <span>🔍 Monitoring for new conversions...</span>
            </AnimatedSpan>

            <AnimatedSpan delay={3500} className="text-cyan-400 block mt-3">
              <span>📊 NEW CONVERSION DETECTED</span>
            </AnimatedSpan>

            <AnimatedSpan delay={4000} className="text-white block mt-1 ml-4">
              <span>• Website: demo-store.com</span>
            </AnimatedSpan>

            <AnimatedSpan delay={4200} className="text-white block mt-1 ml-4">
              <span>• Sale Amount: $299.99</span>
            </AnimatedSpan>

            <AnimatedSpan delay={4400} className="text-white block mt-1 ml-4">
              <span>• Commission: 0.15 SUPRA</span>
            </AnimatedSpan>

            <AnimatedSpan delay={5000} className="text-blue-400 block mt-2">
              <span>🔐 Validating website ownership...</span>
            </AnimatedSpan>

            <AnimatedSpan delay={5500} className="text-green-400 block mt-1">
              <span>✅ Website verified • Processing instant payout</span>
            </AnimatedSpan>

            <AnimatedSpan delay={6000} className="text-yellow-400 block mt-2">
              <span>⚡ Executing smart contract transaction...</span>
            </AnimatedSpan>

            <AnimatedSpan delay={7000} className="text-green-400 block mt-2">
              <span>🎉 SUCCESS! Payout completed</span>
            </AnimatedSpan>

            <AnimatedSpan delay={7500} className="text-cyan-400 block mt-1 font-mono text-sm">
              <span>TxHash: 0xa1b2c3...def456</span>
            </AnimatedSpan>

            <AnimatedSpan delay={8000} className="text-green-400 block mt-2">
              <span>💰 0.15 SUPRA → demo-store.com</span>
            </AnimatedSpan>

            <AnimatedSpan delay={8500} className="text-white block mt-2">
              <span>📈 Total processed today: 47 conversions</span>
            </AnimatedSpan>

            <AnimatedSpan delay={9000} className="text-white block mt-1">
              <span>💸 Total rewards distributed: 12.8 SUPRA</span>
            </AnimatedSpan>

            <TypingAnimation delay={9500} className="text-green-300 block mt-4">
              ✨ Autonomous revenue sharing active • Monitoring continues...
            </TypingAnimation>

            <TypingAnimation delay={10500} className="text-green-400 font-mono mt-3">
              $ agent status: RUNNING 🟢
            </TypingAnimation>
          </Terminal>
        </div>

        {/* Additional info section below terminal */}
        <div className="mt-16 text-center">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-6 rounded-lg bg-muted/50">
              <h3 className="text-lg font-semibold mb-2">🔄 Automated Processing</h3>
              <p className="text-sm text-muted-foreground">
                Conversions are tracked and processed automatically with real Supra token transfers
              </p>
            </div>
            <div className="p-6 rounded-lg bg-muted/50">
              <h3 className="text-lg font-semibold mb-2">⚡ Real-time Payouts</h3>
              <p className="text-sm text-muted-foreground">
                Verified websites receive instant payouts without manual intervention
              </p>
            </div>
            <div className="p-6 rounded-lg bg-muted/50">
              <h3 className="text-lg font-semibold mb-2">🔐 Blockchain Security</h3>
              <p className="text-sm text-muted-foreground">
                All transactions are recorded on Supra blockchain for transparency
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
