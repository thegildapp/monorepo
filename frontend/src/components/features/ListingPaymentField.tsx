import React, { useEffect, useRef, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useMutation, graphql, useLazyLoadQuery } from 'react-relay';
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

const SAVE_PAYMENT_METHOD = graphql`
  mutation ListingPaymentFieldSavePaymentMethodMutation($paymentMethodId: String!) {
    savePaymentMethod(paymentMethodId: $paymentMethodId) {
      id
      brand
      last4
      expMonth
      expYear
      isDefault
    }
  }
`;

const GET_PAYMENT_METHODS = graphql`
  query ListingPaymentFieldQuery {
    myPaymentMethods {
      id
      brand
      last4
      expMonth
      expYear
      isDefault
    }
  }
`;

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

interface ListingPaymentFieldProps {
  onPaymentMethodChange: (paymentMethodId: string | null) => void;
  onCardValidChange?: (isValid: boolean) => void;
  isProcessing?: boolean;
  onSetupComplete?: (customerId: string) => void;
  onError?: (error: string) => void;
}

interface SetupIntentResponse {
  clientSecret: string;
  customerId: string;
}

// Separate component for fetching payment methods with its own Suspense boundary
const PaymentMethodsList: React.FC<{
  onSelectMethod: (methodId: string) => void;
  selectedMethod: string | null;
}> = ({ onSelectMethod, selectedMethod }) => {
  return (
    <React.Suspense fallback={<div className={styles.loading}>Loading saved cards...</div>}>
      <PaymentMethodsListInner onSelectMethod={onSelectMethod} selectedMethod={selectedMethod} />
    </React.Suspense>
  );
};

const PaymentMethodsListInner: React.FC<{
  onSelectMethod: (methodId: string) => void;
  selectedMethod: string | null;
}> = ({ onSelectMethod, selectedMethod }) => {
  const data = useLazyLoadQuery<any>(GET_PAYMENT_METHODS, {});
  const paymentMethods = data?.myPaymentMethods || [];
  
  if (paymentMethods.length === 0) {
    return null;
  }
  
  return (
    <div className={styles.savedCards}>
      <h3 className={styles.savedCardsTitle}>Saved payment methods</h3>
      {paymentMethods.map((method: any) => (
        <label key={method.id} className={styles.savedCardOption}>
          <input
            type="radio"
            name="paymentMethod"
            value={method.id}
            checked={selectedMethod === method.id}
            onChange={() => onSelectMethod(method.id)}
          />
          <div className={styles.cardInfo}>
            <span className={`${styles.cardBrand} ${styles[`brand-${method.brand.toLowerCase()}`]}`}>
              {method.brand}
            </span>
            <span className={styles.cardLast4}>•••• {method.last4}</span>
            <span className={styles.cardExpiry}>
              {method.expMonth}/{method.expYear}
            </span>
            {method.isDefault && <span className={styles.defaultBadge}>Default</span>}
          </div>
        </label>
      ))}
    </div>
  );
};

const PaymentForm: React.FC<ListingPaymentFieldProps> = ({ 
  onPaymentMethodChange,
  onCardValidChange,
  isProcessing = false,
  onSetupComplete,
  onError
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isCardComplete, setIsCardComplete] = useState(false);
  const [setupIntent, setSetupIntent] = useState<{ clientSecret: string; customerId: string } | null>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const cardRef = useRef<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [showNewCard, setShowNewCard] = useState(true); // Default to true to show card input
  
  const [createSetupIntent, isInFlight] = useMutation(CREATE_SETUP_INTENT);
  const [savePaymentMethod] = useMutation(SAVE_PAYMENT_METHOD);

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
    // Focus on card element when component mounts
    setTimeout(() => {
      if (cardRef.current) {
        cardRef.current.focus();
      }
    }, 100);
  }, []);

  const handleCardChange = (event: any) => {
    setError(event.error ? event.error.message : null);
    setIsCardComplete(event.complete);

    // Update card validation state for the parent component
    if (onCardValidChange) {
      onCardValidChange(event.complete);
    }

    // Clear payment method if card is invalid
    if (!event.complete) {
      onPaymentMethodChange(null);
    }
  };

  // Handle selection of existing payment method
  useEffect(() => {
    if (selectedPaymentMethod && !showNewCard) {
      onPaymentMethodChange(selectedPaymentMethod);
      if (onCardValidChange) {
        onCardValidChange(true);
      }
    }
  }, [selectedPaymentMethod, showNewCard, onPaymentMethodChange, onCardValidChange]);
  
  // Save the card when user clicks "Create Listing" (isProcessing becomes true)
  useEffect(() => {
    const saveCard = async () => {
      if (!isProcessing || isSettingUp) return;
      
      // If using existing payment method, just return
      if (selectedPaymentMethod && !showNewCard) {
        return;
      }
      
      // If entering new card, save it
      if (isCardComplete && stripe && elements && setupIntent && showNewCard) {
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) return;
        
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
            const errorMsg = error.message || 'Card setup failed';
            setError(errorMsg);
            onPaymentMethodChange(null);
            if (onError) {
              onError(errorMsg);
            }
          } else if (confirmedSetupIntent && confirmedSetupIntent.payment_method) {
            // Save payment method as default via backend
            const paymentMethodId = confirmedSetupIntent.payment_method as string;
            
            // Call the savePaymentMethod mutation
            savePaymentMethod({
              variables: { paymentMethodId },
              onCompleted: (data: any) => {
                if (data?.savePaymentMethod) {
                  // Card saved successfully
                  onPaymentMethodChange(paymentMethodId);
                  if (onSetupComplete) {
                    onSetupComplete(setupIntent.customerId);
                  }
                }
              },
              onError: (err: Error) => {
                const errorMsg = err.message || 'Failed to save payment method';
                setError(errorMsg);
                onPaymentMethodChange(null);
                if (onError) {
                  onError(errorMsg);
                }
              }
            });
          }
        } catch (err: any) {
          const errorMsg = err.message || 'Failed to save payment information';
          setError(errorMsg);
          onPaymentMethodChange(null);
          if (onError) {
            onError(errorMsg);
          }
        } finally {
          setIsSettingUp(false);
        }
      }
    };
    
    saveCard();
  }, [isProcessing, isCardComplete, stripe, elements, setupIntent, selectedPaymentMethod, showNewCard, isSettingUp, onPaymentMethodChange, onSetupComplete, savePaymentMethod, onError]);

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

      {/* Show saved payment methods if available */}
      <PaymentMethodsList 
        onSelectMethod={(methodId) => {
          setSelectedPaymentMethod(methodId);
          setShowNewCard(false);
        }}
        selectedMethod={selectedPaymentMethod}
      />
      {selectedPaymentMethod && !showNewCard && (
        <button 
          type="button" 
          className={styles.addNewCardButton}
          onClick={() => {
            setShowNewCard(true);
            setSelectedPaymentMethod(null);
          }}
        >
          + Add new payment method
        </button>
      )}

      {showNewCard && (
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
      )}

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