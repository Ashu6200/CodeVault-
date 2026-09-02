'use client';

import { motion } from 'framer-motion';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Navbar, Footer } from '@/components/landing/NavFooter';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-transparent selection:bg-primary/10 selection:text-primary relative">
      <Navbar />
      <main className="flex-1">
        <Hero />
        
        <div id="features" className="py-20">
          <Features />
        </div>

        {/* CTA Section */}
        <section className="py-40 relative overflow-hidden">
          <div className=" px-4 md:px-6 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto rounded-3xl border border-border/30 bg-background/20 backdrop-blur-xl p-12 md:p-20 shadow-2xl shadow-primary/5"
            >
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-8 leading-[1.1]">
                Ready to transform <br />
                your workflow?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground/80 text-lg sm:text-xl mb-12 leading-relaxed">
                Join thousands of developers and teams who use CodeVault 2.0 to 
                build and manage documents with precision.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/dashboard">
                  <Button size="lg" className="h-12 px-10 text-sm rounded-full font-bold shadow-xl shadow-primary/10">
                    Start Your Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="h-12 px-10 text-sm rounded-full font-bold bg-background/20 backdrop-blur-md border-border/40">
                  Talk to Sales
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
