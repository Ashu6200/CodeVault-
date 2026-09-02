'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  FileText, 
  LayoutDashboard, 
  Settings, 
  Users, 
  Key, 
  Activity, 
  Plus, 
  BookOpen, 
  ShieldCheck, 
  Code2, 
  Terminal,
  Command as CommandIcon 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CommandItem {
  name: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  shortcut?: string;
}

interface CommandGroup {
  category: string;
  items: CommandItem[];
}

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const commandGroups: CommandGroup[] = [
    {
      category: 'Navigation',
      items: [
        { name: 'Go to Dashboard', icon: LayoutDashboard, href: '/dashboard', shortcut: 'G D' },
        { name: 'Browse Documents', icon: FileText, href: '/dashboard/documents', shortcut: 'G E' },
        { name: 'Team Members', icon: Users, href: '/dashboard/members', shortcut: 'G M' },
        { name: 'Audit Logs', icon: Activity, href: '/dashboard/audit', shortcut: 'G A' },
      ]
    },
    {
      category: 'Developer & Infrastructure',
      items: [
        { name: 'API Keys & Secrets', icon: Key, href: '/dashboard/apikey', badge: 'Active' },
        { name: 'API Reference Specs', icon: Code2, href: '/dashboard/documents/api', badge: 'v2.4' },
        { name: 'System Health & Status', icon: ShieldCheck, href: '/dashboard/infra', badge: '99.99%' },
      ]
    },
    {
      category: 'Actions & Quick Start',
      items: [
        { name: 'Create New Document', icon: Plus, href: '/dashboard/documents/new', shortcut: 'N' },
        { name: 'Documentation Guides', icon: BookOpen, href: '/dashboard/documents/guides' },
        { name: 'Workspace Settings', icon: Settings, href: '/dashboard/settings', shortcut: 'S' },
      ]
    }
  ];

  const filteredGroups = commandGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((group) => group.items.length > 0);

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] sm:pt-[20vh]">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-void/90 backdrop-blur-[25px]"
        />
        
        {/* Command Menu Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-graphite bg-void shadow-2xl z-10"
        >
          {/* Input Header */}
          <div className="flex items-center border-b border-graphite px-4 py-3.5 gap-3">
            <Search className="h-4 w-4 text-ash-gray shrink-0" />
            <input
              autoFocus
              placeholder="Type a command or search documentation..."
              className="flex-1 bg-transparent text-[14px] text-bone-white outline-none placeholder:text-ash-gray font-mono"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex items-center gap-1 rounded-md border border-graphite bg-void px-2 py-0.5 font-mono text-[10px] font-medium text-ash-gray">
              <span>ESC</span>
            </div>
          </div>

          {/* Commands List */}
          <div className="max-h-[360px] overflow-y-auto p-2 space-y-4">
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <div key={group.category}>
                  <div className="px-3 py-1.5 text-[11px] font-mono font-medium uppercase tracking-wider text-ash-gray">
                    {group.category}
                  </div>
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => {
                          router.push(item.href);
                          setOpen(false);
                        }}
                        className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-[13px] text-bone-white hover:bg-surface-lift hover:text-white transition-colors duration-150 text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-4 w-4 text-ash-gray group-hover:text-iris-violet transition-colors" />
                          <span>{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.badge && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-iris-violet/10 text-iris-violet border border-iris-violet/20 font-medium">
                              {item.badge}
                            </span>
                          )}
                          {item.shortcut && (
                            <span className="font-mono text-[11px] text-ash-gray">
                              {item.shortcut}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm font-mono text-ash-gray">
                No matching commands found.
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between border-t border-graphite bg-surface-lift px-4 py-2.5 text-[11px] font-mono text-ash-gray">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-graphite bg-void px-1 py-0.5 text-[10px]">↑↓</kbd> navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-graphite bg-void px-1 py-0.5 text-[10px]">↵</kbd> select
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-bone-white font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-pulse-green" />
              <span>CodeVault CLI</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
