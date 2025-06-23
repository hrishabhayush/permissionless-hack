import React, { useState, useEffect } from "react";
import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/magicui/terminal";

export function WebsiteAttributionTerminal() {
  const [key, setKey] = useState(0);

  useEffect(() => {
    // Reset the animation every 12 seconds (after all animations complete)
    const interval = setInterval(() => {
      setKey(prev => prev + 1);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full min-h-screen pt-32 pb-16 flex flex-col justify-center">
      {/* Main content container with top padding for navbar space */}
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Title section - moved down from top */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r black bg-clip-text">
            Agent Automation for wallet and revenue share
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Watch the Website Attribution Agent automatically process conversions and distribute real Supra token payouts in real-time
          </p>
        </div>

        {/* Terminal container with proper spacing */}
        <div className="w-full max-w-7xl mx-auto flex justify-center">
          <Terminal key={key} className="min-h-[570px] p-6 w-full max-w-3xl">
            <TypingAnimation className="text-green-400 font-mono">
              Website Attribution Agent&gt; track conversion for website &lt;website ID&gt;
            </TypingAnimation>

            <AnimatedSpan delay={1000} className="text-blue-400 block mt-2">
              <span>Tracking conversion for website ID: &lt;website ID&gt;...</span>
            </AnimatedSpan>

            <AnimatedSpan delay={1500} className="text-green-400 block mt-1">
              <span>Conversion tracked for &lt;website domain&gt;</span>
            </AnimatedSpan>

            <AnimatedSpan delay={2000} className="text-green-400 block mt-1">
              <span>Conversion event recorded (TypeScript SDK only)</span>
            </AnimatedSpan>

            <AnimatedSpan delay={2500} className="text-blue-400 block mt-2">
              <span>Website already verified.</span>
            </AnimatedSpan>

            <AnimatedSpan delay={3000} className="text-blue-400 block mt-1">
              <span>Current balance: &lt;your supra wallet balance&gt;</span>
            </AnimatedSpan>

            <AnimatedSpan delay={3500} className="text-blue-400 block mt-1">
              <span>Preparing payout to: &lt;your supra wallet address&gt;</span>
            </AnimatedSpan>

            <AnimatedSpan delay={4000} className="text-green-400 block mt-1">
              <span>Validated receiver address: 0x88cdfbca933fb6e17bb79e1a6a447cc884bad716</span>
            </AnimatedSpan>

            <AnimatedSpan delay={4500} className="text-blue-400 block mt-1">
              <span>Sending 0.1 Supra tokens to &lt;website domain&gt;...</span>
            </AnimatedSpan>

            <AnimatedSpan delay={5000} className="text-yellow-400 block mt-2">
              <span>Transaction Request Sent, Waiting For Completion</span>
            </AnimatedSpan>

            <AnimatedSpan delay={6000} className="text-green-400 block mt-2">
              <span>Payout successful! Transaction hash:</span>
            </AnimatedSpan>

            <AnimatedSpan delay={6200} className="text-cyan-400 block mt-1 font-mono text-sm break-all">
              <span>&lt;transaction hash&gt;</span>
            </AnimatedSpan>

            <AnimatedSpan delay={6500} className="text-green-400 block mt-2">
              <span>Sent 0.1 Supra tokens to &lt;website domain&gt;</span>
            </AnimatedSpan>

            <AnimatedSpan delay={7000} className="text-cyan-400 block mt-1">
              <span>Transaction recorded on Supra blockchain</span>
            </AnimatedSpan>

            <AnimatedSpan delay={7500} className="text-green-400 block mt-2">
              <span>Immediate payout processed for verified website</span>
            </AnimatedSpan>

            <AnimatedSpan delay={8000} className="text-green-400 block mt-1">
              <span>Conversion tracked successfully!</span>
            </AnimatedSpan>

            <AnimatedSpan delay={8500} className="text-white block mt-2">
              <span>Conversion ID: &lt;conversion ID&gt;</span>
            </AnimatedSpan>

            <AnimatedSpan delay={9000} className="text-white block mt-1">
              <span>Payout Amount: 0.1 Supra tokens</span>
            </AnimatedSpan>
          </Terminal>
        </div>
      </div>
    </div>
  );
}
