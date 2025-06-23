"use client";

import React, { forwardRef, useRef } from "react";

import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/magicui/animated-beam";

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
        className,
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

export function AnimatedBeamMultipleOutputDemo({
  className,
}: {
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const openaiRef = useRef<HTMLDivElement>(null);
  const chromeRef = useRef<HTMLDivElement>(null);
  const ethereumRef = useRef<HTMLDivElement>(null);
  const solanaRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn(
        "relative flex h-[300px] w-full items-center justify-center overflow-hidden p-6",
        className,
      )}
      ref={containerRef}
    >
      <div className="flex size-full max-w-lg flex-row items-center justify-between gap-6">
        <div className="flex flex-col justify-center">
          <Circle ref={userRef} className="border-gray-200">
            <Icons.user />
          </Circle>
        </div>
        <div className="flex flex-col justify-center">
          <Circle ref={openaiRef} className="size-16 border-gray-200">
            <Icons.openai />
          </Circle>
        </div>
        <div className="flex flex-col justify-center gap-4">
          <Circle ref={chromeRef} className="border-blue-200">
            <Icons.chrome />
          </Circle>
          <Circle ref={ethereumRef} className="border-blue-300">
            <Icons.ethereum />
          </Circle>
          <Circle ref={solanaRef} className="border-purple-200">
            <Icons.solana />
          </Circle>
        </div>
      </div>

      {/* AnimatedBeams - Looping sequence */}
      <AnimatedBeam
        containerRef={containerRef as React.RefObject<HTMLElement>}
        fromRef={userRef as React.RefObject<HTMLElement>}
        toRef={openaiRef as React.RefObject<HTMLElement>}
        duration={1000}
        delay={0}
      />
      <AnimatedBeam
        containerRef={containerRef as React.RefObject<HTMLElement>}
        fromRef={openaiRef as React.RefObject<HTMLElement>}
        toRef={chromeRef as React.RefObject<HTMLElement>}
        duration={800}
        curvature={-20}
        delay={700}
      />
      <AnimatedBeam
        containerRef={containerRef as React.RefObject<HTMLElement>}
        fromRef={openaiRef as React.RefObject<HTMLElement>}
        toRef={ethereumRef as React.RefObject<HTMLElement>}
        duration={800}
        delay={900}
      />
      <AnimatedBeam
        containerRef={containerRef as React.RefObject<HTMLElement>}
        fromRef={openaiRef as React.RefObject<HTMLElement>}
        toRef={solanaRef as React.RefObject<HTMLElement>}
        duration={800}
        curvature={20}
        delay={1100}
      />
    </div>
  );
}

const Icons = {
  user: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#333333"
      strokeWidth="2"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  chrome: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" fill="#2563eb"/>
      <circle cx="12" cy="12" r="4" fill="#fff"/>
      <path d="m12 2c5.52 0 10 4.48 10 10 0 5.52-4.48 10-10 10s-10-4.48-10-10c0-5.52 4.48-10 10-10z" fill="none" stroke="#fff" strokeWidth="0"/>
      <path d="m12 8v8" stroke="#2563eb" strokeWidth="1"/>
      <path d="m8 12h8" stroke="#2563eb" strokeWidth="1"/>
      <circle cx="12" cy="12" r="2" fill="#2563eb"/>
      <path d="M12 2A10 10 0 0 0 4.9 4.9L12 12V2z" fill="#dc2626"/>
      <path d="M22 12A10 10 0 0 0 19.1 4.9L12 12h10z" fill="#eab308"/>
      <path d="M12 22A10 10 0 0 0 19.1 19.1L12 12v10z" fill="#16a34a"/>
    </svg>
  ),
  ethereum: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 0L5.5 12.25L12 16.5L18.5 12.25L12 0Z"
        fill="#3b5998"
      />
      <path
        d="M12 17.5L5.5 13.25L12 24L18.5 13.25L12 17.5Z"
        fill="#3b5998"
        fillOpacity="0.6"
      />
      <path
        d="M12 15.5L5.5 11.25L12 1L18.5 11.25L12 15.5Z"
        fill="#3b5998"
        fillOpacity="0.2"
      />
    </svg>
  ),
  solana: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 397.7 311.7"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="solanaGradientDark" x1="360.8791" y1="351.4553" x2="141.213" y2="131.7893" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#00FFA3"/>
          <stop offset="1" stopColor="#DC1FFF"/>
        </linearGradient>
        <linearGradient id="solanaGradientDark2" x1="264.8291" y1="401.6014" x2="45.163" y2="181.9354" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#00FFA3"/>
          <stop offset="1" stopColor="#DC1FFF"/>
        </linearGradient>
        <linearGradient id="solanaGradientDark3" x1="312.5484" y1="77.4595" x2="92.8822" y2="-142.2064" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#00FFA3"/>
          <stop offset="1" stopColor="#DC1FFF"/>
        </linearGradient>
      </defs>
      <path d="M64.6,237.9c2.4-2.4,5.7-3.8,9.2-3.8h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,237.9z" fill="url(#solanaGradientDark)"/>
      <path d="M64.6,3.8C67.1,1.4,70.4,0,73.8,0h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,3.8z" fill="url(#solanaGradientDark2)"/>
      <path d="M333.1,120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8,0-8.7,7-4.6,11.1l62.7,62.7c2.4,2.4,5.7,3.8,9.2,3.8h317.4c5.8,0,8.7-7,4.6-11.1L333.1,120.1z" fill="url(#solanaGradientDark3)"/>
    </svg>
  ),
  openai: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="#1f2937"
    >
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
    </svg>
  ),
};

export default AnimatedBeamMultipleOutputDemo; 