'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FolderPlus, PenLine, ShieldCheck, Activity, CheckCircle2, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Create Your Workspace',
    subtitle: 'Set up your team environment in seconds',
    icon: FolderPlus,
    highlight: 'workspace → engineering-core',
    description: 'Sign up and create a dedicated workspace for your team. Organize projects, invite collaborators, and configure access policies — all from the dashboard.',
    preview: [
      { label: 'Workspace Name', value: 'engineering-core', color: 'text-iris-violet' },
      { label: 'Region', value: 'US-East (Auto)', color: 'text-sky-blue' },
      { label: 'Team Size', value: 'Up to 50 seats', color: 'text-bone-white' },
      { label: 'Plan', value: 'Team Pro', color: 'text-pulse-green' },
    ],
  },
  {
    number: '02',
    title: 'Write & Collaborate',
    subtitle: 'Rich editor with real-time multiplayer',
    icon: PenLine,
    highlight: 'doc → Architecture Spec v2.4',
    description: 'Use the TipTap-powered rich editor to create specs, guides, and documentation. Real-time multiplayer sync lets your team co-edit with CRDT conflict resolution.',
    preview: [
      { label: 'Editor', value: 'TipTap Rich Text', color: 'text-iris-violet' },
      { label: 'Collaboration', value: 'Real-time CRDT Sync', color: 'text-pulse-green' },
      { label: 'Formats', value: 'Markdown, HTML, JSON', color: 'text-bone-white' },
      { label: 'Version History', value: 'Unlimited Snapshots', color: 'text-sky-blue' },
    ],
  },
  {
    number: '03',
    title: 'Manage Access & Roles',
    subtitle: 'Granular RBAC for every document',
    icon: ShieldCheck,
    highlight: 'policy → restricted, admin-only',
    description: 'Assign workspace-level roles and document-specific permissions. Control who can view, edit, comment, or admin-manage every piece of content.',
    preview: [
      { label: 'Role: Admin', value: 'Full Control', color: 'text-pulse-green' },
      { label: 'Role: Editor', value: 'Read + Write', color: 'text-sky-blue' },
      { label: 'Role: Viewer', value: 'Read Only', color: 'text-bone-white' },
      { label: 'IP Whitelist', value: 'Enabled', color: 'text-amber' },
    ],
  },
  {
    number: '04',
    title: 'Track & Audit Everything',
    subtitle: 'Complete visibility over document lifecycle',
    icon: Activity,
    highlight: 'audit → 2,481 events this month',
    description: 'Monitor every edit, view, and access event with detailed audit logs. Track document engagement, version diffs, and team activity from a unified dashboard.',
    preview: [
      { label: 'Total Events', value: '2,481 this month', color: 'text-iris-violet' },
      { label: 'Active Users', value: '36 contributors', color: 'text-sky-blue' },
      { label: 'Avg. Response', value: '< 45ms globally', color: 'text-pulse-green' },
      { label: 'Compliance', value: 'SOC2 Ready', color: 'text-amber' },
    ],
  },
];

export function HowToUse() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="py-24 relative bg-void border-t border-graphite" id="how-to-use">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-graphite px-3 py-1 text-[12px] font-mono text-iris-violet"
          >
            <span>QUICKSTART GUIDE</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[40px] sm:text-[48px] md:text-[56px] font-normal text-white leading-[1.1]"
            style={{ letterSpacing: '-0.05em' }}
          >
            How to use CodeVault.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="max-w-[600px] text-ash-gray text-[18px] leading-[1.6]"
          >
            Go from zero to a live, production-ready documentation platform in four simple steps.
          </motion.p>
        </div>

        {/* Step Navigation Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === idx;
            return (
              <button
                key={step.number}
                onClick={() => setActiveStep(idx)}
                className={`p-5 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between ${
                  isActive
                    ? 'border-iris-violet bg-surface-lift text-white'
                    : 'border-graphite bg-void text-ash-gray hover:border-iron hover:text-bone-white'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`font-mono text-[13px] font-bold ${isActive ? 'text-iris-violet' : 'text-ash-gray'}`}>
                    STEP {step.number}
                  </span>
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-ash-gray'}`} />
                </div>
                <div>
                  <h4 className="font-medium text-[16px] text-white mb-1">{step.title}</h4>
                  <p className="text-[13px] text-ash-gray line-clamp-1">{step.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Step Showcase Box */}
        <div className="rounded-2xl border border-graphite bg-void overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-graphite">
          {/* Left: Step Explanation */}
          <div className="lg:col-span-5 p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 font-mono text-[12px] text-iris-violet">
                <span>PHASE {steps[activeStep].number} OF 04</span>
              </div>
              <h3 className="text-[28px] font-normal text-white mb-3 font-display">
                {steps[activeStep].title}
              </h3>
              <p className="text-ash-gray text-[15px] leading-[1.6] mb-6">
                {steps[activeStep].description}
              </p>
            </div>

            {/* Quick highlight pill */}
            <div className="p-4 rounded-xl border border-graphite bg-surface-lift font-mono text-[13px] text-bone-white flex items-center justify-between">
              <span className="text-pulse-green">→ {steps[activeStep].highlight}</span>
              <ArrowRight className="h-4 w-4 text-ash-gray" />
            </div>
          </div>

          {/* Right: Preview card */}
          <div className="lg:col-span-7 p-6 bg-void font-mono text-[13px] leading-[1.7] overflow-x-auto flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-graphite text-[12px] text-ash-gray">
              <span className="text-bone-white font-medium">{steps[activeStep].title}</span>
              <span className="text-iris-violet">Configuration</span>
            </div>
            <div className="space-y-3 flex-1">
              {steps[activeStep].preview.map((item) => (
                <div key={item.label} className="flex justify-between p-3 rounded-md bg-surface-lift border border-graphite">
                  <span className="text-ash-gray">{item.label}</span>
                  <span className={item.color}>{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-graphite flex items-center justify-between text-[11px] text-ash-gray">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-pulse-green" />
                Fully configured and production-ready
              </span>
              <span className="text-iris-violet">CodeVault 2.0</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
