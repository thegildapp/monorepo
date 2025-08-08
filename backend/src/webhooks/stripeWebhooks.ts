import { Request, Response } from 'express';
import Stripe from 'stripe';
import stripe from '../config/stripe';
import { prismaWrite, prismaRead } from '../config/prisma';
import { logger } from '../services/loggingService';
import { sendEmail } from '../services/emailService';

// Get webhook secret from environment
const endpointSecret = process.env['STRIPE_WEBHOOK_SECRET'] || '';

export async function handleStripeWebhook(req: Request, res: Response): Promise<Response> {
  const sig = req.headers['stripe-signature'] as string;

  if (!endpointSecret) {
    logger.error('Stripe webhook secret not configured');
    return res.status(500).send('Webhook Error: Configuration missing');
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      endpointSecret
    );
  } catch (err: any) {
    logger.error('Webhook signature verification failed', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object as Stripe.Dispute);
        break;

      case 'customer.source.expiring':
        await handleCardExpiring(event.data.object as Stripe.Card);
        break;

      case 'setup_intent.succeeded':
        await handleSetupIntentSucceeded(event.data.object as Stripe.SetupIntent);
        break;

      default:
        logger.info(`Unhandled webhook event type: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (error) {
    logger.error('Error processing webhook', error as Error, { 
      metadata: { eventType: event.type, eventId: event.id } 
    });
    return res.status(500).send('Webhook processing error');
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  logger.info('Payment succeeded', { 
    metadata: { 
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      customerId: paymentIntent.customer 
    } 
  });

  // Update listing payment status if this is a listing fee
  if (paymentIntent.metadata?.['type'] === 'listing_fee') {
    const listing = await prismaRead.listing.findFirst({
      where: { paymentIntentId: paymentIntent.id }
    });

    if (listing && !listing.paidAt) {
      await prismaWrite.listing.update({
        where: { id: listing.id },
        data: {
          paidAt: new Date(),
          listingFeePaid: paymentIntent.amount,
        }
      });

      // Send confirmation email
      const user = await prismaRead.user.findUnique({
        where: { id: paymentIntent.metadata['userId'] }
      });

      if (user?.email) {
        await sendEmail({
          to: user.email,
          subject: 'Payment Confirmation - Listing Created',
          html: `
            <h2>Payment Successful</h2>
            <p>Your payment of $${(paymentIntent.amount / 100).toFixed(2)} for your listing has been processed successfully.</p>
            <p>Listing: ${paymentIntent.metadata['listingTitle']}</p>
            <p>Your listing is now being reviewed and will be live shortly.</p>
            <p>Remember: If you don't receive any inquiries within 30 days, you'll receive a full refund.</p>
          `
        });
      }
    }
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  logger.error('Payment failed', new Error('Payment failed'), {
    metadata: {
      paymentIntentId: paymentIntent.id,
      error: paymentIntent.last_payment_error?.message,
      customerId: paymentIntent.customer
    }
  });

  // Mark listing as payment failed
  if (paymentIntent.metadata?.['type'] === 'listing_fee') {
    const listing = await prismaRead.listing.findFirst({
      where: { paymentIntentId: paymentIntent.id }
    });

    if (listing) {
      await prismaWrite.listing.update({
        where: { id: listing.id },
        data: {
          status: 'PAYMENT_FAILED'
        }
      });

      // Notify user
      const user = await prismaRead.user.findUnique({
        where: { id: paymentIntent.metadata['userId'] }
      });

      if (user?.email) {
        await sendEmail({
          to: user.email,
          subject: 'Payment Failed - Action Required',
          html: `
            <h2>Payment Failed</h2>
            <p>We were unable to process your payment for the listing "${paymentIntent.metadata['listingTitle']}".</p>
            <p>Error: ${paymentIntent.last_payment_error?.message || 'Payment declined'}</p>
            <p>Please update your payment method and try again.</p>
          `
        });
      }
    }
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  logger.info('Charge refunded', {
    metadata: {
      chargeId: charge.id,
      amount: charge.amount_refunded,
      paymentIntentId: charge.payment_intent
    }
  });

  // Update listing refund status
  if (charge.payment_intent) {
    const listing = await prismaRead.listing.findFirst({
      where: { paymentIntentId: charge.payment_intent as string }
    });

    if (listing) {
      await prismaWrite.listing.update({
        where: { id: listing.id },
        data: {
          refundedAt: new Date()
        }
      });

      // Notify user
      const user = await prismaRead.user.findUnique({
        where: { id: listing.sellerId }
      });

      if (user?.email) {
        await sendEmail({
          to: user.email,
          subject: 'Refund Processed',
          html: `
            <h2>Refund Processed</h2>
            <p>Your refund of $${(charge.amount_refunded / 100).toFixed(2)} has been processed.</p>
            <p>The refund should appear in your account within 5-10 business days.</p>
          `
        });
      }
    }
  }
}

async function handleDisputeCreated(dispute: Stripe.Dispute) {
  logger.error('Payment dispute created', new Error('Dispute created'), {
    metadata: {
      disputeId: dispute.id,
      amount: dispute.amount,
      reason: dispute.reason,
      paymentIntentId: dispute.payment_intent
    }
  });

  // Mark listing as disputed
  if (dispute.payment_intent) {
    const listing = await prismaRead.listing.findFirst({
      where: { paymentIntentId: dispute.payment_intent as string }
    });

    if (listing) {
      await prismaWrite.listing.update({
        where: { id: listing.id },
        data: {
          status: 'DISPUTED'
        }
      });

      // Notify admin
      logger.error('Listing payment disputed', new Error('Payment disputed'), {
        metadata: {
          listingId: listing.id,
          disputeId: dispute.id,
          reason: dispute.reason
        }
      });
    }
  }
}

async function handleCardExpiring(card: Stripe.Card) {
  logger.info('Card expiring soon', {
    metadata: {
      customerId: card.customer,
      last4: card.last4,
      expMonth: card.exp_month,
      expYear: card.exp_year
    }
  });

  // Notify user about expiring card
  if (card.customer) {
    const user = await prismaRead.user.findFirst({
      where: { stripeCustomerId: card.customer as string }
    });

    if (user?.email) {
      await sendEmail({
        to: user.email,
        subject: 'Payment Method Expiring Soon',
        html: `
          <h2>Card Expiring Soon</h2>
          <p>Your card ending in ${card.last4} will expire on ${card.exp_month}/${card.exp_year}.</p>
          <p>Please update your payment method to ensure uninterrupted service.</p>
          <p><a href="https://thegild.app/settings">Update Payment Method</a></p>
        `
      });
    }
  }
}

async function handleSetupIntentSucceeded(setupIntent: Stripe.SetupIntent) {
  logger.info('Setup intent succeeded', {
    metadata: {
      setupIntentId: setupIntent.id,
      customerId: setupIntent.customer,
      paymentMethodId: setupIntent.payment_method
    }
  });

  // Log successful card setup
  if (setupIntent.metadata?.['userId']) {
    logger.info('Payment method saved successfully', {
      metadata: {
        userId: setupIntent.metadata['userId'],
        customerId: setupIntent.customer
      }
    });
  }
}

// Function to check for listings eligible for refund (30 days, no inquiries)
export async function checkRefundEligibility() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    // Find listings that are:
    // - Paid more than 30 days ago
    // - Not yet refunded
    // - Have no inquiries
    const eligibleListings = await prismaRead.listing.findMany({
      where: {
        paidAt: {
          lte: thirtyDaysAgo
        },
        refundedAt: null,
        paymentIntentId: {
          not: null
        },
        inquiries: {
          none: {}
        }
      },
      include: {
        seller: true
      }
    });

    for (const listing of eligibleListings) {
      if (listing.paymentIntentId) {
        try {
          // Create refund
          const refund = await stripe.refunds.create({
            payment_intent: listing.paymentIntentId,
            reason: 'requested_by_customer',
            metadata: {
              reason: 'no_inquiries_30_days',
              listingId: listing.id
            }
          });

          logger.info('Automatic refund processed', {
            metadata: {
              listingId: listing.id,
              refundId: refund.id,
              amount: refund.amount
            }
          });

          // Update listing
          await prismaWrite.listing.update({
            where: { id: listing.id },
            data: {
              refundedAt: new Date()
            }
          });

          // Notify user
          if (listing.seller.email) {
            await sendEmail({
              to: listing.seller.email,
              subject: 'Automatic Refund - No Inquiries Received',
              html: `
                <h2>Automatic Refund Processed</h2>
                <p>As promised, since your listing "${listing.title}" didn't receive any inquiries within 30 days, we've processed a full refund.</p>
                <p>Amount refunded: $${((listing.listingFeePaid || 0) / 100).toFixed(2)}</p>
                <p>The refund should appear in your account within 5-10 business days.</p>
                <p>Feel free to try listing again with updated photos or description!</p>
              `
            });
          }
        } catch (error) {
          logger.error('Failed to process automatic refund', error as Error, {
            metadata: { listingId: listing.id }
          });
        }
      }
    }

    logger.info(`Checked ${eligibleListings.length} listings for refund eligibility`);
  } catch (error) {
    logger.error('Error checking refund eligibility', error as Error);
  }
}