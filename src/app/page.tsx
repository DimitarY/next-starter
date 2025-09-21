"use client";

import { motion } from "framer-motion";
import { Database, Palette, Shield, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleOnHover = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      {/* Hero Section */}
      <section className="container max-w-7xl mx-auto py-24 md:py-32">
        <motion.div
          className="flex flex-col items-center text-center space-y-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={fadeInUp}>
            <Badge variant="secondary" className="mb-4">
              <Zap className="h-3 w-3 mr-1" />
              Production Ready
            </Badge>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-balance max-w-4xl"
            variants={fadeInUp}
          >
            Next.js Starter with{" "}
            <span className="text-primary">Secure Auth</span>
          </motion.h1>

          <motion.p
            className="text-xl text-muted-foreground text-balance max-w-2xl"
            variants={fadeInUp}
          >
            A modern, production-ready Next.js template featuring better-auth,
            Drizzle ORM, TanStack Query, and shadcn/ui. Get started with
            authentication and security built-in.
          </motion.p>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container max-w-7xl mx-auto py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Build Fast
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Modern technologies working together seamlessly for your next
              project
            </p>
          </div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp} {...scaleOnHover}>
              <Card className="h-full border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <Shield className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>Better Auth</CardTitle>
                  <CardDescription>
                    Modern authentication with built-in security best practices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Email & Password</li>
                    <li>• Social Providers</li>
                    <li>• Session Management</li>
                    <li>• CSRF Protection</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} {...scaleOnHover}>
              <Card className="h-full border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <Database className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>Drizzle ORM</CardTitle>
                  <CardDescription>
                    Type-safe database operations with excellent developer
                    experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Type Safety</li>
                    <li>• SQL-like Syntax</li>
                    <li>• Migrations</li>
                    <li>• Multi-DB Support</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} {...scaleOnHover}>
              <Card className="h-full border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <Zap className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>TanStack Query</CardTitle>
                  <CardDescription>
                    Powerful data synchronization for server state management
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Caching</li>
                    <li>• Background Updates</li>
                    <li>• Optimistic Updates</li>
                    <li>• Error Handling</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} {...scaleOnHover}>
              <Card className="h-full border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <Palette className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>shadcn/ui</CardTitle>
                  <CardDescription>
                    Beautiful, accessible components built with Radix UI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Accessible</li>
                    <li>• Customizable</li>
                    <li>• Dark Mode</li>
                    <li>• TypeScript</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
