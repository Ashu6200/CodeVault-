'use client';

import { motion } from 'framer-motion';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { HowToUse } from '@/components/landing/HowToUse';
import { WhyToUse } from '@/components/landing/WhyToUse';
import { Navbar, Footer } from '@/components/landing/NavFooter';
import Link from 'next/link';
import { ArrowRight, Terminal, CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-void relative">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <Hero />

        {/* Bento Features Section */}
        <Features />

        {/* How to Use Section */}
        <HowToUse />

        {/* Why to Use / Advantage Section */}
        <WhyToUse />

        {/* Developer Architecture & Security Spec Section */}
        <section className="py-24 border-t border-graphite bg-void">
          <div className="max-w-[1200px] mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left Column — Copy */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-graphite px-3 py-1 text-[12px] font-mono text-pulse-green">
                  <span>RESEND DESIGN SYSTEM ARCHITECTURE</span>
                </div>
                <h2 
                  className="text-[36px] sm:text-[44px] font-normal text-white leading-[1.1] font-display"
                  style={{ letterSpacing: '-0.03em' }}
                >
                  Designed like a terminal wrapped in luxury UI.
                </h2>
                <p className="text-ash-gray text-[16px] leading-[1.7]">
                  CodeVault combines deep monospaced clarity (JetBrains Mono) with ultra-refined Playfair Display typography and pure black surfaces. Layer separation is achieved strictly through 1px hairline graphite borders (`#292d30`).
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-iris-violet mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-white font-medium text-[15px]">Iris Violet (#9281f7) Developer Markers</h4>
                      <p className="text-ash-gray text-[14px]">Used strictly for email strings, status indicators, and key identifier highlights.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-pulse-green mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-white font-medium text-[15px]">Low Elevation Hairline Borders</h4>
                      <p className="text-ash-gray text-[14px]">Every layer is delineated by 1px #292d30 borders for minimal visual weight.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-sky-blue mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-white font-medium text-[15px]">Restrained Motion</h4>
                      <p className="text-ash-gray text-[14px]">Subtle 3D cube rotation, clean fade-in slides, and instant interactive feedback.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column — Interactive Feature Card */}
              <div className="rounded-2xl border border-graphite bg-surface-lift p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-graphite pb-4 font-mono text-[12px]">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-iris-violet" />
                    <span className="text-white font-semibold">Vault Security Spec</span>
                  </div>
                  <span className="text-pulse-green px-2 py-0.5 rounded bg-pulse-green/10 border border-pulse-green/20">PASSED</span>
                </div>

                <div className="space-y-3 font-mono text-[12px]">
                  <div className="flex justify-between p-2.5 rounded bg-void border border-graphite">
                    <span className="text-ash-gray">TLS Version</span>
                    <span className="text-white">TLS 1.3 (ChaCha20-Poly1305)</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded bg-void border border-graphite">
                    <span className="text-ash-gray">Encryption At Rest</span>
                    <span className="text-white">AES-256-GCM</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded bg-void border border-graphite">
                    <span className="text-ash-gray">Identity Provider</span>
                    <span className="text-iris-violet">Better-Auth (OIDC/SAML)</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded bg-void border border-graphite">
                    <span className="text-ash-gray">Data Residency</span>
                    <span className="text-sky-blue">US-East & EU-West</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 relative border-t border-graphite">
          <div className="max-w-[1200px] mx-auto px-6 md:px-10 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto rounded-2xl border border-graphite bg-void p-12 md:p-16"
            >
              <h2 
                className="text-[36px] sm:text-[44px] md:text-[56px] font-normal text-white leading-[1.1] mb-6 font-display"
                style={{ letterSpacing: '-0.03em' }}
              >
                Ready to transform <br />
                your workflow?
              </h2>
              <p className="mx-auto max-w-[500px] text-ash-gray text-[18px] leading-[1.6] mb-10">
                Join thousands of developers and teams who use CodeVault 2.0 to 
                build and manage documents with precision.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/dashboard">
                  <button className="h-11 px-7 text-[14px] font-medium text-white bg-transparent border border-graphite rounded-md hover:border-white transition-all duration-150 inline-flex items-center gap-2">
                    Start Building Free
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link href="/login">
                  <button className="h-11 px-7 text-[14px] font-medium text-bone-white bg-transparent border border-graphite rounded-md hover:border-white/60 transition-all duration-150">
                    Talk to Sales
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
