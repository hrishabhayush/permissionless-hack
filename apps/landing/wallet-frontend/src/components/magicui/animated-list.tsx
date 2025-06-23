"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import React, {
  ComponentPropsWithoutRef,
  useEffect,
  useMemo,
  useState,
} from "react";

export function AnimatedListItem({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring" as const, stiffness: 350, damping: 40 }}
      layout
      className="mx-auto w-full"
    >
      {children}
    </motion.div>
  );
}

export interface AnimatedListProps extends ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
  delay?: number;
  maxVisible?: number;
}

export const AnimatedList = React.memo(
  ({ children, className, delay = 1000, maxVisible = 5, ...props }: AnimatedListProps) => {
    const [visibleItems, setVisibleItems] = useState<React.ReactElement[]>([]);
    const childrenArray = useMemo(
      () => React.Children.toArray(children) as React.ReactElement[],
      [children],
    );

    useEffect(() => {
      const interval = setInterval(() => {
        setVisibleItems((prevItems) => {
          // Get a random item from the children array
          const randomIndex = Math.floor(Math.random() * childrenArray.length);
          const newItem = childrenArray[randomIndex];
          
          // Create a new item with a unique key for proper animation
          const itemWithKey = React.cloneElement(newItem, {
            key: `${Date.now()}-${randomIndex}`,
          });
          
          // Add new item at the beginning and keep only maxVisible items
          const updatedItems = [itemWithKey, ...prevItems.slice(0, maxVisible - 1)];
          return updatedItems;
        });
      }, delay);

      return () => clearInterval(interval);
    }, [childrenArray, delay, maxVisible]);

    return (
      <div
        className={cn(`flex flex-col items-center gap-4`, className)}
        {...props}
      >
        <AnimatePresence>
          {visibleItems.map((item) => (
            <AnimatedListItem key={item.key}>
              {item}
            </AnimatedListItem>
          ))}
        </AnimatePresence>
      </div>
    );
  },
);

AnimatedList.displayName = "AnimatedList";
