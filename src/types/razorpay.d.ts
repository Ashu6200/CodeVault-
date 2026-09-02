// Ambient declarations for the Razorpay checkout script, which is loaded from
// their CDN at runtime and has no npm types.
//
// This file must NOT contain a top-level import/export: that would make it a
// module and scope these interfaces to it, leaving `RazorpayOptions` undefined
// at its use site in src/hooks/useRazorpay.ts.

interface RazorpayOptions {
  key: string;
  subscription_id?: string;
  order_id?: string;
  name: string;
  description?: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayPaymentResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open(): void;
  close(): void;
}

interface Window {
  Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
}
