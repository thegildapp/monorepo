import React, { useEffect, useRef, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  PaymentRequestButtonElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useMutation, graphql } from 'react-relay';
import { STRIPE_PUBLIC_KEY, stripeConfig } from '../../config/stripe';
import styles from './ListingPaymentField.module.css';

const CREATE_SETUP_INTENT = graphql`
  mutation ListingPaymentFieldCreateSetupIntentMutation {
    createSetupIntent {
      clientSecret
      customerId
    }
  }
`;

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

interface ListingPaymentFieldProps {
  onPaymentMethodChange: (paymentMethodId: string | null) => void;
  isProcessing?: boolean;
  onSetupComplete?: (customerId: string) => void;
}

interface SetupIntentResponse {
  clientSecret: string;
  customerId: string;
}

const PaymentForm: React.FC<ListingPaymentFieldProps> = ({ 
  onPaymentMethodChange,
  isProcessing = false,
  onSetupComplete 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isCardComplete, setIsCardComplete] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [canMakePayment, setCanMakePayment] = useState(false);
  const [setupIntent, setSetupIntent] = useState<{ clientSecret: string; customerId: string } | null>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const cardRef = useRef<any>(null);
  
  const [createSetupIntent, isInFlight] = useMutation(CREATE_SETUP_INTENT);

  // Create SetupIntent when component mounts
  useEffect(() => {
    if (isInFlight) return;
    
    createSetupIntent({
      variables: {},
      onCompleted: (data: any) => {
        if (data?.createSetupIntent) {
          setSetupIntent(data.createSetupIntent);
        }
      },
      onError: (error: Error) => {
        console.error('Failed to create setup intent:', error);
        setError('Failed to initialize payment setup');
      },
    });
  }, []);

  useEffect(() => {
    if (!stripe) return;

    const pr = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label: 'Listing Fee',
        amount: Math.round(stripeConfig.listingFee * 100), // Amount in cents
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    // Check if the Payment Request API is available
    pr.canMakePayment().then(result => {
      if (result) {
        setPaymentRequest(pr);
        setCanMakePayment(true);
      }
    });

    // Handle payment method creation for Apple Pay/Google Pay
    pr.on('paymentmethod', async (event) => {
      onPaymentMethodChange(event.paymentMethod.id);
      event.complete('success');
    });
  }, [stripe, onPaymentMethodChange]);

  useEffect(() => {
    // Focus on card element when component mounts (only if no payment request button)
    if (!canMakePayment) {
      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.focus();
        }
      }, 100);
    }
  }, [canMakePayment]);

  const handleCardChange = async (event: any) => {
    setError(event.error ? event.error.message : null);
    setIsCardComplete(event.complete);

    // Mark as ready when card is valid (but don't save yet)
    if (event.complete) {
      onPaymentMethodChange('pending'); // Use 'pending' to indicate card is valid but not saved
    } else {
      onPaymentMethodChange(null);
    }
  };

  // Save the card when the component indicates it's ready (called by parent on Finish)
  useEffect(() => {
    const saveCard = async () => {
      if (isCardComplete && stripe && elements && setupIntent && isProcessing) {
        const cardElement = elements.getElement(CardElement);
        if (cardElement) {
          setIsSettingUp(true);
          try {
            // Confirm the SetupIntent to save the card
            const { error, setupIntent: confirmedSetupIntent } = await stripe.confirmCardSetup(
              setupIntent.clientSecret,
              {
                payment_method: {
                  card: cardElement,
                },
              }
            );

            if (error) {
              setError(error.message || 'Card setup failed');
              onPaymentMethodChange(null);
            } else if (confirmedSetupIntent && confirmedSetupIntent.payment_method) {
              // Card saved successfully
              onPaymentMethodChange(confirmedSetupIntent.payment_method as string);
              if (onSetupComplete) {
                onSetupComplete(setupIntent.customerId);
              }
            }
          } catch (err) {
            setError('Failed to save payment information');
            onPaymentMethodChange(null);
          } finally {
            setIsSettingUp(false);
          }
        }
      }
    };

    if (isProcessing) {
      saveCard();
    }
  }, [isProcessing, isCardComplete, stripe, elements, setupIntent, onPaymentMethodChange, onSetupComplete]);

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        fontFamily: '"Tinos", serif',
        color: '#000000',
        '::placeholder': {
          color: '#999999',
        },
        iconColor: '#000000',
      },
      invalid: {
        color: '#dc3545',
        iconColor: '#dc3545',
      },
    },
    disableLink: true, // Disable Link autofill button
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Payment for listing</h2>
      
      <div className={styles.feeInfo}>
        <div className={styles.feeAmount}>
          ${stripeConfig.listingFee.toFixed(2)} listing fee
        </div>
        <p className={styles.refundText}>
          Fully refundable if you receive no inquiries within {stripeConfig.refundPeriodDays} days.
          Your card will be saved for future listings.
        </p>
      </div>

      {/* Show Apple Pay/Google Pay button if available */}
      {canMakePayment && paymentRequest && (
        <div className={styles.expressPaymentContainer}>
          <div className={styles.divider}>
            <span>Express checkout</span>
          </div>
          <PaymentRequestButtonElement
            options={{
              paymentRequest,
              style: {
                paymentRequestButton: {
                  type: 'default',
                  theme: 'dark',
                  height: '48px',
                },
              },
            }}
          />
          <div className={styles.divider}>
            <span>Or pay with card</span>
          </div>
        </div>
      )}

      <div className={styles.cardContainer}>
        <label className={styles.label}>Card information</label>
        <div className={styles.cardElement}>
          <CardElement 
            options={cardElementOptions}
            onChange={handleCardChange}
            onReady={(element) => { cardRef.current = element; }}
          />
        </div>
        {error && (
          <div className={styles.error}>{error}</div>
        )}
      </div>

      <div className={styles.securityNote}>
        <svg className={styles.lockIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0110 0v4"></path>
        </svg>
        Your payment information is secure and encrypted
      </div>

      {(isProcessing || isSettingUp) && (
        <div className={styles.processing}>
          {isSettingUp ? 'Saving payment method...' : 'Processing payment...'}
        </div>
      )}
    </div>
  );
};

const ListingPaymentField: React.FC<ListingPaymentFieldProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default ListingPaymentField;