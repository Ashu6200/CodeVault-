'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center pt-40 pb-24 overflow-hidden">
      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center space-y-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center rounded-full border border-border/40 bg-background/40 px-4 py-1.5 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground mb-4 backdrop-blur-md"
          >
            <Sparkles className="mr-2 h-3.5 w-3.5 text-primary/80" />
            <span>CodeVault 2.0 Beta</span>
          </motion.div>
          
          <div className="space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl font-bold tracking-tight sm:text-7xl md:text-8xl max-w-5xl leading-[0.95]"
            >
              The modular <br />
              <span className="bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent">
                standard.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="max-w-[600px] mx-auto text-muted-foreground/80 text-lg sm:text-xl leading-relaxed font-medium"
            >
              Engineered for precision. Built for speed. The next generation of 
              documentation management for high-performance teams.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 pt-6"
          >
            <Link href="/dashboard">
              <Button size="lg" className="h-12 px-10 text-sm rounded-full font-bold shadow-xl shadow-primary/5 hover:shadow-primary/10 transition-all duration-300">
                Start Building
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="h-12 px-10 text-sm rounded-full font-bold border-border/40 bg-background/20 backdrop-blur-md hover:bg-background/40 transition-all duration-300">
              Read Docs
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative mt-24 w-full max-w-6xl rounded-2xl border border-border/30 bg-muted/5 p-2 backdrop-blur-sm shadow-[0_0_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden"
          >
            <div className="rounded-xl overflow-hidden border border-border/20 bg-background/30">
              <Image
                src="/modern_docs_dashboard_mockup.png"
                alt="CodeVault Dashboard Mockup"
                width={1400}
                height={900}
                className="w-full h-auto object-cover opacity-90"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
