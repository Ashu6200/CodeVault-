import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] -z-10" />
      
      <main className="w-full max-w-md px-4 py-8">
        {children}
      </main>
      
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>© 2026 CodeVault Inc. Secure & Collaborative.</p>
      </div>
    </div>
  );
}
