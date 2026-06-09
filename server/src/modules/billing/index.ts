export { BillingController } from './billing.controller';
export { BillingService } from './billing.service';
export { default as billingRoutes } from './billing.routes';
export * from './billing.schema';


// Standalone webhook handler for top-level registration in app.ts (before body parsers)
import { BillingController } from './billing.controller';
const _controller = new BillingController();
export const razorpayWebhookHandler = _controller.razorpayWebhook;
