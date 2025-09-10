"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="h-full-without-header bg-background text-foreground flex flex-col items-center justify-center p-4">
      <motion.div
        className="text-primary text-9xl font-bold"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        404
      </motion.div>
      <motion.h1
        className="mt-4 mb-2 text-center text-4xl font-semibold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Oops! Page Not Found
      </motion.h1>
      <motion.p
        className="text-muted-foreground mb-8 text-center text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        The page you are looking for doesn&#39;t exist or has been moved.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </motion.div>
    </div>
  );
}
