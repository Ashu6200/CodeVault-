'use client';

import { motion } from 'framer-motion';
import { 
  Shield, 
  Zap, 
  Code2, 
  Clock,
  CheckCircle2,
} from 'lucide-react';

export function Features() {
  return (
    <section className="py-24 relative bg-void" id="features">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-graphite px-3 py-1 text-[12px] font-mono text-iris-violet"
          >
            <span>ENGINEERED FOR TEAMS</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[40px] sm:text-[48px] md:text-[56px] font-normal text-white leading-[1.1]"
            style={{ letterSpacing: '-0.05em' }}
          >
            Everything you need. Nothing you don&apos;t.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="max-w-[640px] text-ash-gray text-[18px] leading-[1.6]"
          >
            A cohesive suite of document management tools, built on top of high-performance infrastructure with zero unnecessary flair.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Bento Item 1 — Real-time Sync & Events (Large Column 8) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-8 rounded-2xl border border-graphite bg-void p-8 flex flex-col justify-between overflow-hidden relative group hover:border-iron transition-colors"
          >
            <div>
              <div className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: 'linear-gradient(to right bottom, #9281f7, #9a54dc)' }}>
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-[20px] font-medium text-white mb-2">Real-Time Multiplayer Sync & Event Hooks</h3>
              <p className="text-ash-gray text-[15px] max-w-[540px] leading-[1.6]">
                Every edit, comment, and structural change is propagated in under 15ms across global nodes with CRDT conflict resolution.
              </p>
            </div>

            {/* Interactive Status Indicator Badges Demo */}
            <div className="mt-8 pt-6 border-t border-graphite grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[12px]">
              <div className="p-3 rounded-md border border-graphite bg-surface-lift">
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2 w-2 rounded-full bg-pulse-green" />
                  <span className="text-white font-medium">delivered</span>
                </div>
                <p className="text-ash-gray text-[10px]">99.98% delivery rate</p>
              </div>

              <div className="p-3 rounded-md border border-graphite bg-surface-lift">
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2 w-2 rounded-full bg-sky-blue" />
                  <span className="text-white font-medium">opened</span>
                </div>
                <p className="text-ash-gray text-[10px]">Instant client render</p>
              </div>

              <div className="p-3 rounded-md border border-graphite bg-surface-lift">
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2 w-2 rounded-full bg-iris-glow" />
                  <span className="text-white font-medium">clicked</span>
                </div>
                <p className="text-ash-gray text-[10px]">Inline link tracking</p>
              </div>

              <div className="p-3 rounded-md border border-graphite bg-surface-lift">
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2 w-2 rounded-full bg-alarm-red" />
                  <span className="text-white font-medium">bounced</span>
                </div>
                <p className="text-ash-gray text-[10px]">Auto-retry queue</p>
              </div>
            </div>
          </motion.div>

          {/* Bento Item 2 — Granular Access Control (Column 4) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-4 rounded-2xl border border-graphite bg-void p-8 flex flex-col justify-between hover:border-iron transition-colors"
          >
            <div>
              <div className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: 'linear-gradient(to right bottom, #9281f7, #9a54dc)' }}>
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-[20px] font-medium text-white mb-2">Enterprise RBAC & Scopes</h3>
              <p className="text-ash-gray text-[14px] leading-[1.6]">
                Define document access with workspace-level roles, token scopes, and IP whitelist policies.
              </p>
            </div>

            <div className="mt-6 font-mono text-[11px] space-y-2 border-t border-graphite pt-4">
              <div className="flex items-center justify-between p-2 rounded bg-surface-lift border border-graphite">
                <span className="text-ash-gray">Role: Admin</span>
                <span className="text-pulse-green">Full Control</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-surface-lift border border-graphite">
                <span className="text-ash-gray">Scope: docs:write</span>
                <span className="text-iris-violet font-semibold">Active Token</span>
              </div>
            </div>
          </motion.div>

          {/* Bento Item 3 — Version Control & History (Column 4) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-4 rounded-2xl border border-graphite bg-void p-8 flex flex-col justify-between hover:border-iron transition-colors"
          >
            <div>
              <div className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: 'linear-gradient(to right bottom, #9281f7, #9a54dc)' }}>
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-[20px] font-medium text-white mb-2">Immutable Version Control</h3>
              <p className="text-ash-gray text-[14px] leading-[1.6]">
                Revert to any point in time with atomic snapshot history and line-by-line diff audit logs.
              </p>
            </div>

            <div className="mt-6 font-mono text-[11px] bg-surface-lift p-3 rounded-md border border-graphite space-y-1">
              <div className="text-pulse-green">+ export const API_VERSION = &apos;v2.4.0&apos;;</div>
              <div className="text-alarm-red">- export const API_VERSION = &apos;v2.3.9&apos;;</div>
              <div className="text-ash-gray text-[10px] mt-2 pt-1 border-t border-graphite flex justify-between">
                <span>Commit: 8f92a1</span>
                <span>2 mins ago</span>
              </div>
            </div>
          </motion.div>

          {/* Bento Item 4 — Seamless Team Collaboration (Column 8) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-8 rounded-2xl border border-graphite bg-void p-8 flex flex-col justify-between hover:border-iron transition-colors"
          >
            <div>
              <div className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: 'linear-gradient(to right bottom, #9281f7, #9a54dc)' }}>
                <Code2 className="h-5 w-5" />
              </div>
              <h3 className="text-[20px] font-medium text-white mb-2">Seamless Team Collaboration</h3>
              <p className="text-ash-gray text-[15px] leading-[1.6]">
                Built-in workspace management, team invitations, and real-time notifications keep your entire organization aligned on every document.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-graphite grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-[12px]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-pulse-green" />
                <span className="text-bone-white">Team Workspaces</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-pulse-green" />
                <span className="text-bone-white">Role-Based Access</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-pulse-green" />
                <span className="text-bone-white">Live Notifications</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
