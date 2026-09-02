'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative flex flex-col items-center pt-32 pb-20 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 relative z-10 w-full">
        {/* Centered Hero Content */}
        <div className="flex flex-col items-center text-center gap-8 max-w-[800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2.5 rounded-full border border-graphite bg-void px-3.5 py-1.5 text-[13px] font-medium text-bone-white hover:border-iron transition-colors">
              <span className="h-2 w-2 rounded-full bg-pulse-green animate-pulse" />
              <span>CodeVault 2.0 Engine Released</span>
              <ArrowRight className="h-3.5 w-3.5 text-iris-violet" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-[48px] sm:text-[64px] md:text-[80px] font-normal text-white leading-[0.95] font-display"
            style={{ letterSpacing: '-0.04em' }}
          >
            Document with
            <br />
            precision.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="max-w-[560px] text-ash-gray text-[18px] leading-[1.6] font-normal"
          >
            A curated platform where engineering teams create, manage, and collaborate on documentation with enterprise-grade security and real-time sync.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-2"
          >
            <Link href="/dashboard">
              <button className="h-11 px-7 text-[14px] font-medium text-white bg-transparent border border-graphite rounded-md hover:border-white transition-all duration-150 inline-flex items-center gap-2">
                Start Building Free
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <Link href="/dashboard/documents">
              <button className="h-11 px-7 text-[14px] font-medium text-bone-white bg-transparent border border-graphite rounded-md hover:border-white/60 transition-all duration-150">
                Explore the Platform
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Dashboard Preview Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 w-full rounded-2xl border border-graphite bg-void overflow-hidden shadow-2xl"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-graphite bg-void px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className="h-4 w-[1px] bg-graphite mx-1" />
              <span className="font-mono text-[12px] text-ash-gray">app.codevault.dev/dashboard</span>
            </div>
            <div className="flex items-center gap-4 font-mono text-[11px]">
              <span className="flex items-center gap-1.5 text-pulse-green">
                <span className="h-1.5 w-1.5 rounded-full bg-pulse-green animate-ping" />
                LIVE
              </span>
            </div>
          </div>

          {/* Dashboard Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-graphite">
            {/* Left: Your Workspace Profile */}
            <div className="lg:col-span-4 p-6 bg-void">
              <div className="mb-4 pb-3 border-b border-graphite">
                <p className="text-[10px] uppercase tracking-widest text-ash-gray font-mono mb-3">YOUR WORKSPACE</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-iris-violet flex items-center justify-center text-white text-[11px] font-bold">
                    CV
                  </div>
                  <div>
                    <p className="text-white text-[14px] font-medium">CodeVault Workspace</p>
                    <p className="text-ash-gray text-[12px] font-mono">engineering-core</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2.5 font-mono text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="text-ash-gray">Documents</span>
                  <span className="text-white font-medium">248</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ash-gray">Team Members</span>
                  <span className="text-white font-medium">36</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ash-gray">Active Workspaces</span>
                  <span className="text-white font-medium">5</span>
                </div>
              </div>
            </div>

            {/* Right: Suggested Docs / Activity */}
            <div className="lg:col-span-8 p-6 bg-void">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-graphite">
                <span className="text-white font-medium text-[14px]">Recent Documents</span>
                <span className="text-iris-violet font-mono text-[11px]">High Activity</span>
              </div>
              <div className="space-y-3">
                {[
                  { title: 'Global Architecture Spec v2.4', tag: 'architecture', desc: 'Core infrastructure spec. Last edited by lead architect.', action: 'Published', actionColor: 'text-pulse-green' },
                  { title: 'Security Audit Report Q3', tag: 'security', desc: 'Compliance review. Requires sign-off from security team.', action: 'In Review', actionColor: 'text-sky-blue' },
                  { title: 'Team Onboarding Guide', tag: 'onboarding', desc: 'New member walkthrough. Auto-shared on workspace join.', action: 'View Doc', actionColor: 'text-bone-white' },
                ].map((doc) => (
                  <div key={doc.title} className="p-3.5 rounded-xl border border-graphite bg-surface-lift hover:border-iron transition-colors flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-graphite flex items-center justify-center shrink-0 font-mono text-[11px] text-ash-gray font-bold uppercase">
                        {doc.tag.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white text-[13px] font-medium truncate">{doc.title}</p>
                          <span className="text-[10px] font-mono text-ash-gray px-1.5 py-0.5 rounded bg-void border border-graphite shrink-0">{doc.tag}</span>
                        </div>
                        <p className="text-ash-gray text-[11px] mt-0.5 truncate">{doc.desc}</p>
                      </div>
                    </div>
                    <button className={`text-[12px] font-mono font-medium ${doc.actionColor} shrink-0 px-3 py-1.5 rounded-md border border-graphite hover:border-iron transition-colors flex items-center gap-1`}>
                      {doc.action}
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
        >
          {[
            { value: '99.99%', label: 'Uptime SLA' },
            { value: '<45ms', label: 'Global Latency' },
            { value: '10M+', label: 'Docs Rendered / Mo' },
            { value: '248+', label: 'Active Teams' },
          ].map((stat) => (
            <div key={stat.label} className="p-5 rounded-2xl border border-graphite bg-void">
              <p className="text-[22px] font-medium text-white font-mono">{stat.value}</p>
              <p className="text-[12px] text-ash-gray font-sans mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Customer Logo Trust Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 pt-10 border-t border-graphite text-center"
        >
          <p className="text-[12px] uppercase tracking-widest text-ash-gray font-mono mb-8">
            Trusted by engineering teams at industry leaders
          </p>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center opacity-70">
            {['WARNER BROS', 'RAYCAST', 'VERCEL', 'LINEAR', 'FRAMER', 'SUPABASE'].map((logo) => (
              <div key={logo} className="font-mono text-[14px] font-bold text-bone-white tracking-widest hover:text-white transition-colors cursor-default">
                {logo}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
