'use client';

import { motion } from 'framer-motion';
import { 
  Users, 
  Shield, 
  Zap, 
  Code2, 
  Layers, 
  Bell,
  Clock,
  Key
} from 'lucide-react';

const features = [
  {
    title: 'Real-time Collaboration',
    description: 'Work together in real-time with your team. See cursors, typing indicators, and instant sync.',
    icon: Users,
  },
  {
    title: 'Advanced RBAC',
    description: 'Granular permissions at the workspace and document level. Manage access with precision.',
    icon: Shield,
  },
  {
    title: 'Notion-style Editor',
    description: 'A rich text editor that feels natural. Slash commands, block styling, and nested docs.',
    icon: Zap,
  },
  {
    title: 'Developer Focused',
    description: 'Built by developers, for developers. API-first architecture and extensible modules.',
    icon: Code2,
  },
  {
    title: 'Nested Documents',
    description: 'Organize your thoughts with unlimited hierarchy. Simple, powerful document tree.',
    icon: Layers,
  },
  {
    title: 'Instant Notifications',
    description: 'Stay updated with a built-in notification system. Know when your documents are edited.',
    icon: Bell,
  },
  {
    title: 'Version History',
    description: 'Never lose a change. Track versions and restore any previous state with a click.',
    icon: Clock,
  },
  {
    title: 'Secure API Keys',
    description: 'Generate and manage API keys with custom scopes for secure external integrations.',
    icon: Key,
  }
];

export function Features() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className=" px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-6 text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
          >
            Built for scale.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="max-w-[700px] text-muted-foreground/80 text-lg sm:text-xl leading-relaxed"
          >
            CodeVault 2.0 comes packed with enterprise-grade features to help your team 
            collaborate faster and more securely.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group relative rounded-2xl border border-border/30 bg-background/30 p-8 md:p-10 hover:bg-background/50 hover:border-border/60 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-muted/40 text-foreground/60 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-3 font-bold text-lg tracking-tight">{feature.title}</h3>
              <p className="text-muted-foreground/80 text-sm leading-relaxed font-medium">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
