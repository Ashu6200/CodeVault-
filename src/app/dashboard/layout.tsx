import Script from 'next/script';
import { AppLayout } from '@/components/layout/AppLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout>
      {/* Razorpay checkout SDK — loaded lazily, only when checkout is triggered */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      {children}
    </AppLayout>
  );
}
