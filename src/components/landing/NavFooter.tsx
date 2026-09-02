'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export function Navbar() {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed w-full top-0 z-50 flex h-16 items-center px-6 md:px-10 bg-void/90 backdrop-blur-[25px] border-b border-graphite/40"
    >
      <div className="max-w-[1200px] mx-auto flex items-center justify-between w-full">
        <Link href="/" className="flex items-center gap-2.5 font-semibold text-[15px] tracking-tight text-white">
          <div className="h-7 w-7 rounded-md bg-iris-violet flex items-center justify-center text-white text-[11px] font-bold">
            CV
          </div>
          <span className="hidden sm:block">CodeVault</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-[14px] font-normal text-bone-white">
          <Link href="#features" className="hover:text-white transition-colors duration-150">The Platform</Link>
          <Link href="#how-to-use" className="hover:text-white transition-colors duration-150">How it Works</Link>
          <Link href="#why-to-use" className="hover:text-white transition-colors duration-150">Manifesto</Link>
        </nav>
        <div className="flex items-center gap-5">
          <Link href="/login" className="text-[14px] font-normal text-bone-white hover:text-white transition-colors duration-150 hidden sm:block">
            Sign In
          </Link>
          <Link href="/dashboard">
            <button className="h-9 px-4 text-[13px] font-medium text-white bg-transparent border border-graphite rounded-md hover:border-white/60 transition-all duration-150">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-graphite py-8 bg-void">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[14px] text-ash-gray">
        <p>© 2026 CodeVault Inc. Designed with Resend Black Velvet & Iris Violet.</p>
        <div className="flex gap-6">
          <Link href="#how-to-use" className="hover:text-white transition-colors duration-150">How it Works</Link>
          <Link href="#why-to-use" className="hover:text-white transition-colors duration-150">Manifesto</Link>
          <Link href="#" className="hover:text-white transition-colors duration-150">Privacy</Link>
          <Link href="#" className="hover:text-white transition-colors duration-150">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
