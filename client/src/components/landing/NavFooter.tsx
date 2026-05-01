'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

export function Navbar() {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center border-b border-border/20 bg-background/30 backdrop-blur-xl px-4 md:px-6"
    >
      <div className="container flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-base tracking-tight">
          <div className="h-7 w-7 rounded-lg bg-primary/90 flex items-center justify-center text-primary-foreground text-[12px] shadow-lg shadow-primary/20">
            CV
          </div>
          <span className="hidden sm:block">CodeVault</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-muted-foreground/70">
          <Link href="#features" className="hover:text-foreground transition-all duration-300">Features</Link>
          <Link href="#pricing" className="hover:text-foreground transition-all duration-300">Pricing</Link>
          <Link href="#docs" className="hover:text-foreground transition-all duration-300">Docs</Link>
        </nav>
        <div className="flex items-center gap-5">
          <button 
            onClick={() => {
              const event = new KeyboardEvent('keydown', {
                key: 'k',
                metaKey: true,
                ctrlKey: true,
                bubbles: true
              });
              document.dispatchEvent(event);
            }}
            className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-border/30 bg-muted/20 text-[11px] font-medium text-muted-foreground/60 hover:bg-muted/40 transition-all duration-300"
          >
            <Search className="h-3 w-3" />
            <span>Search...</span>
            <span className="opacity-40 text-[9px] font-bold">⌘K</span>
          </button>
          <Link href="/login" className="text-[13px] font-bold text-muted-foreground/70 hover:text-foreground transition-all duration-300 hidden sm:block">
            Sign In
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="h-9 rounded-full px-5 text-[11px] font-bold shadow-lg shadow-primary/10">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/30 py-20">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight mb-6">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                C
              </div>
              CodeVault
            </Link>
            <p className="text-muted-foreground max-w-[320px] text-[15px] leading-relaxed">
              The modern standard for collaborative document management. Built for teams that demand precision and speed.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-6 uppercase tracking-widest text-foreground/80">Product</h4>
            <ul className="space-y-4 text-[15px] text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">API Keys</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Security</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Changelog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-6 uppercase tracking-widest text-foreground/80">Resources</h4>
            <ul className="space-y-4 text-[15px] text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">Documentation</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Community</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-6 uppercase tracking-widest text-foreground/80">Company</h4>
            <ul className="space-y-4 text-[15px] text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/50 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-[13px] text-muted-foreground">
          <p>© 2026 CodeVault Inc. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-primary transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
