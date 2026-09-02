import type { NextConfig } from "next";

// Content-Security-Policy.
//
// Adapted from the Express/helmet policy the API used to set. Two directives are
// deliberately looser than the original, because the original would have broken
// this app the moment it served HTML:
//   - script-src needs 'unsafe-inline' + 'unsafe-eval' for Next's hydration
//     bootstrap, and needs checkout.razorpay.com for the billing flow.
//   - connect-src / frame-src need Razorpay for the checkout modal.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' https: data:",
  "connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com",
  "frame-src https://api.razorpay.com https://checkout.razorpay.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
].join("; ");

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Node-only / native dependencies must not be bundled by the server compiler.
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-pg",
    "pg",
    "ioredis",
    "bcryptjs",
    "winston",
    "winston-daily-rotate-file",
  ],

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=15552000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
