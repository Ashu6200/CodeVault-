import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative bg-void">
      <main className="w-full max-w-md px-4 py-8">
        <div className="rounded-2xl border border-graphite bg-void p-8">
          {children}
        </div>
      </main>
      
      <div className="mt-8 text-center text-[14px] text-ash-gray">
        <p>© 2026 CodeVault Inc. Secure & Collaborative.</p>
      </div>
    </div>
  );
}
