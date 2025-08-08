import React, { useEffect, useRef, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { STRIPE_PUBLIC_KEY, stripeConfig } from '../../config/stripe';
import styles from './ListingPaymentField.module.css';

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

interface ListingPaymentFieldProps {
  onPaymentMethodChange: (paymentMethodId: string | null) => void;
  isProcessing?: boolean;
}

const PaymentForm: React.FC<ListingPaymentFieldProps> = ({ 
  onPaymentMethodChange,
  isProcessing = false 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isCardComplete, setIsCardComplete] = useState(false);
  const cardRef = useRef<any>(null);

  useEffect(() => {
    // Focus on card element when component mounts
    setTimeout(() => {
      if (cardRef.current) {
        cardRef.current.focus();
      }
    }, 100);
  }, []);

  const handleCardChange = async (event: any) => {
    setError(event.error ? event.error.message : null);
    setIsCardComplete(event.complete);

    if (event.complete && stripe && elements) {
      const cardElement = elements.getElement(CardElement);
      if (cardElement) {
        try {
          const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
          });

          if (error) {
            setError(error.message || 'Payment method creation failed');
            onPaymentMethodChange(null);
          } else if (paymentMethod) {
            onPaymentMethodChange(paymentMethod.id);
          }
        } catch (err) {
          setError('Failed to process payment information');
          onPaymentMethodChange(null);
        }
      }
    } else {
      onPaymentMethodChange(null);
    }
  };

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
          Fully refundable if you receive no inquiries within {stripeConfig.refundPeriodDays} days
        </p>
      </div>

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

      {isProcessing && (
        <div className={styles.processing}>Processing payment...</div>
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