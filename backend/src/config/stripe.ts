import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] || '', {
  apiVersion: '2025-07-30.basil',
  typescript: true,
});

// Configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env['STRIPE_PUBLISHABLE_KEY'] || '',
  secretKey: process.env['STRIPE_SECRET_KEY'] || '',
  currency: 'usd',
  // Payment settings
  paymentMethods: ['card'],
  // Listing fee in cents (e.g., 500 = $5.00)
  listingFee: 500,
};

// Validate Stripe configuration
export function validateStripeConfig(): void {
  if (!process.env['STRIPE_SECRET_KEY']) {
    console.warn('⚠️  STRIPE_SECRET_KEY is not configured');
  }
  if (!process.env['STRIPE_PUBLISHABLE_KEY']) {
    console.warn('⚠️  STRIPE_PUBLISHABLE_KEY is not configured');
  }
}

export default stripe;