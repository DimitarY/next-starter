"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

export default function GoodbyePage() {
  return (
    <div className="h-full-without-header bg-background text-foreground flex flex-col items-center justify-center p-4">
      <motion.div
        className="text-primary text-9xl font-bold"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.8,
          type: "spring",
          bounce: 0.4,
        }}
      >
        👋
      </motion.div>
      <motion.h1
        className="mt-4 mb-2 text-center text-4xl font-semibold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Goodbye!
      </motion.h1>
      <motion.p
        className="text-muted-foreground mb-8 max-w-md text-center text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        Your account has been successfully deleted. Thank you for being with us.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </motion.div>

      {/* Additional animated elements for visual interest */}
      <motion.div
        className="absolute"
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0, 1, 0],
          scale: [0.8, 1.2, 0.8],
          x: [-100, 100, -100],
          y: [-50, 50, -50],
        }}
        transition={{
          delay: 1,
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        <div className="text-primary/20 text-6xl">✨</div>
      </motion.div>

      <motion.div
        className="absolute"
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0, 1, 0],
          scale: [0.8, 1.2, 0.8],
          x: [100, -100, 100],
          y: [50, -50, 50],
        }}
        transition={{
          delay: 1.5,
          duration: 7,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        <div className="text-primary/20 text-6xl">✨</div>
      </motion.div>
    </div>
  );
}
