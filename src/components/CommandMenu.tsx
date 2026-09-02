'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, LayoutDashboard, Settings, Users, Command as CommandIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

  const commands = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Documents', icon: FileText, href: '/dashboard/documents' },
    { name: 'Members', icon: Users, href: '/dashboard/members' },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  const filteredCommands = commands.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] sm:pt-[25vh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
        >
          <div className="flex items-center border-b px-4 py-3">
            <Search className="mr-2 h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex items-center gap-1 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">ESC</span>
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto p-2">
            <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Suggested
            </div>
            {filteredCommands.length > 0 ? (
              filteredCommands.map((cmd) => (
                <button
                  key={cmd.name}
                  onClick={() => {
                    router.push(cmd.href);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                >
                  <cmd.icon className="h-4 w-4 text-muted-foreground" />
                  {cmd.name}
                </button>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No results found.
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-2 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-background px-1 py-0.5">↑↓</kbd> to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-background px-1 py-0.5">↵</kbd> to select
              </span>
            </div>
            <div className="flex items-center gap-1 font-semibold">
               CodeVault <CommandIcon className="h-3 w-3 ml-1" /> K
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
