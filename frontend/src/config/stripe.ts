export const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

export const stripeConfig = {
  listingFee: 5.00, // $5.00 listing fee
  currency: 'usd',
  refundPeriodDays: 30,
};