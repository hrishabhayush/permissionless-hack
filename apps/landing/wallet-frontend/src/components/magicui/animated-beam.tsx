"use client";

import { cn } from "@/lib/utils";
import { useEffect, useId, useRef, useState } from "react";

interface AnimatedBeamProps {
  className?: string;
  containerRef: React.RefObject<HTMLElement>;
  fromRef: React.RefObject<HTMLElement>;
  toRef: React.RefObject<HTMLElement>;
  curvature?: number;
  reverse?: boolean;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  delay?: number;
  duration?: number;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
}

export const AnimatedBeam: React.FC<AnimatedBeamProps> = ({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 2000,
  delay = 0,
  pathColor = "gray",
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = "#18CCFC",
  gradientStopColor = "#6344F5",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
}) => {
  const id = useId();
  const [pathD, setPathD] = useState("");
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

  const updatePath = () => {
    if (containerRef.current && fromRef.current && toRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const fromRect = fromRef.current.getBoundingClientRect();
      const toRect = toRef.current.getBoundingClientRect();

      const relativeFromX = fromRect.left - containerRect.left + fromRect.width / 2 + startXOffset;
      const relativeFromY = fromRect.top - containerRect.top + fromRect.height / 2 + startYOffset;
      const relativeToX = toRect.left - containerRect.left + toRect.width / 2 + endXOffset;
      const relativeToY = toRect.top - containerRect.top + toRect.height / 2 + endYOffset;

      const midX = (relativeFromX + relativeToX) / 2;
      const midY = (relativeFromY + relativeToY) / 2;

      const controlX = midX + curvature;
      const controlY = midY + curvature;

      const d = `M ${relativeFromX},${relativeFromY} Q ${controlX},${controlY} ${relativeToX},${relativeToY}`;
      setPathD(d);
      setSvgDimensions({
        width: containerRect.width,
        height: containerRect.height,
      });
    }
  };

  useEffect(() => {
    updatePath();
    window.addEventListener("resize", updatePath);
    return () => window.removeEventListener("resize", updatePath);
  }, []);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      updatePath();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <svg
      fill="none"
      width={svgDimensions.width}
      height={svgDimensions.height}
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "pointer-events-none absolute left-0 top-0 transform-gpu stroke-2",
        className,
      )}
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
    >
      <path
        d={pathD}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        fill="none"
      />
      <path
        d={pathD}
        strokeWidth={pathWidth}
        stroke={`url(#${id})`}
        strokeOpacity="1"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="20 20"
        style={{
          animationDuration: `${duration}ms`,
          animationDelay: `${delay}ms`,
          animationDirection: reverse ? "reverse" : "normal",
          animationIterationCount: "infinite",
          animationName: "beam-flow",
          strokeDashoffset: "40",
        }}
      />
      <defs>
        <linearGradient
          className={cn("transform-gpu")}
          id={id}
          gradientUnits="userSpaceOnUse"
          x1="0%"
          x2="100%"
          y1="0"
          y2="0"
        >
          <stop stopColor={gradientStartColor} stopOpacity="0" offset="0%" />
          <stop stopColor={gradientStartColor} stopOpacity="1" offset="50%" />
          <stop stopColor={gradientStopColor} stopOpacity="0" offset="100%" />
        </linearGradient>
        <style>
          {`
            @keyframes beam-flow {
              0% { stroke-dashoffset: 40; }
              100% { stroke-dashoffset: -40; }
            }
          `}
        </style>
      </defs>
    </svg>
  );
}; 