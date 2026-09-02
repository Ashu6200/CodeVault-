'use client';

import { motion } from 'framer-motion';
import { 
  Terminal, 
  Check, 
  X, 
  Cpu, 
  Lock, 
  Gauge, 
} from 'lucide-react';

const pillars = [
  {
    title: 'Terminal-Grade Simplicity',
    description: 'Designed like a luxury terminal. High-contrast typography, zero-bloat navigation, and instant ⌘K command menu.',
    icon: Terminal,
    tag: 'USER EXPERIENCE',
  },
  {
    title: 'Sub-45ms Edge Performance',
    description: 'Global CDN distribution ensures markdown specs render instantly for engineering teams across the world.',
    icon: Gauge,
    tag: 'LATENCY & SPEED',
  },
  {
    title: 'Zero-Trust RBAC Security',
    description: 'Granular token permissions, workspace isolation, secret signing, and automated SOC2-compliant audit logs.',
    icon: Lock,
    tag: 'SECURITY & GOVERNANCE',
  },
  {
    title: 'Unified Workspace Hub',
    description: 'Centralized team dashboard with real-time notifications, activity feeds, and cross-workspace search for total visibility.',
    icon: Cpu,
    tag: 'TEAM PRODUCTIVITY',
  },
];

const comparisonData = [
  {
    feature: 'UI Aesthetic & Load Speed',
    traditional: 'Heavy drop shadows, slow 2.5s renders, bloated menus',
    codevault: 'Pure #000000 canvas, <45ms edge render, hairline borders',
  },
  {
    feature: 'Team Collaboration',
    traditional: 'Manual sharing, email-based review cycles',
    codevault: 'Real-time multiplayer editing with CRDT sync',
  },
  {
    feature: 'Version History & Diffs',
    traditional: 'Basic snapshot restoration without diff details',
    codevault: 'Atomic CRDT diff history with line-by-line audit',
  },
  {
    feature: 'Security & Access Scopes',
    traditional: 'Coarse admin/user roles with shared credentials',
    codevault: 'Granular token scopes, SAML/OIDC, IP Whitelisting',
  },
];

export function WhyToUse() {
  return (
    <section className="py-24 relative bg-void border-t border-graphite" id="why-to-use">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-graphite px-3 py-1 text-[12px] font-mono text-pulse-green"
          >
            <span>THE CODEVAULT ADVANTAGE</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[40px] sm:text-[48px] md:text-[56px] font-normal text-white leading-[1.1]"
            style={{ letterSpacing: '-0.05em' }}
          >
            Why engineering teams choose CodeVault.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="max-w-[620px] text-ash-gray text-[18px] leading-[1.6]"
          >
            Built from the ground up to eliminate the friction of legacy documentation platforms.
          </motion.p>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="rounded-2xl border border-graphite bg-void p-7 flex flex-col justify-between hover:border-iron transition-colors group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: 'linear-gradient(to right bottom, #9281f7, #9a54dc)' }}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono text-ash-gray font-semibold tracking-wider uppercase">
                      {pillar.tag}
                    </span>
                  </div>
                  <h3 className="text-[18px] font-medium text-white mb-2 group-hover:text-iris-violet transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-ash-gray text-[14px] leading-[1.6]">
                    {pillar.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Side-by-Side Architectural Comparison Table */}
        <div className="rounded-2xl border border-graphite bg-void overflow-hidden">
          <div className="p-6 border-b border-graphite flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-[20px] font-medium text-white font-display">Architectural Comparison</h3>
              <p className="text-ash-gray text-[14px]">How CodeVault contrasts with legacy documentation suites</p>
            </div>
            <div className="flex items-center gap-4 text-[12px] font-mono">
              <span className="flex items-center gap-1.5 text-ash-gray">
                <span className="h-2 w-2 rounded-full bg-alarm-red" /> Legacy Systems
              </span>
              <span className="flex items-center gap-1.5 text-pulse-green">
                <span className="h-2 w-2 rounded-full bg-pulse-green" /> CodeVault 2.0
              </span>
            </div>
          </div>

          <div className="divide-y divide-graphite font-mono text-[13px]">
            {comparisonData.map((row) => (
              <div key={row.feature} className="grid grid-cols-1 md:grid-cols-12 p-5 items-center gap-4 hover:bg-surface-lift transition-colors">
                <div className="md:col-span-4 text-white font-medium">
                  {row.feature}
                </div>
                <div className="md:col-span-4 text-ash-gray flex items-center gap-2">
                  <X className="h-4 w-4 text-alarm-red shrink-0" />
                  <span className="text-[12px]">{row.traditional}</span>
                </div>
                <div className="md:col-span-4 text-bone-white flex items-center gap-2">
                  <Check className="h-4 w-4 text-pulse-green shrink-0" />
                  <span className="text-[12px] font-semibold text-white">{row.codevault}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
