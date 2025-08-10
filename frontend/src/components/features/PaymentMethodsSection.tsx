import React, { useState } from 'react';
import { useLazyLoadQuery, useMutation, graphql } from 'react-relay';
import Button from '../common/Button';
import styles from './PaymentMethodsSection.module.css';

const GET_PAYMENT_METHODS = graphql`
  query PaymentMethodsSectionQuery {
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

const SET_DEFAULT_PAYMENT_METHOD = graphql`
  mutation PaymentMethodsSectionSetDefaultMutation($paymentMethodId: String!) {
    setDefaultPaymentMethod(paymentMethodId: $paymentMethodId) {
      id
      isDefault
    }
  }
`;

const DELETE_PAYMENT_METHOD = graphql`
  mutation PaymentMethodsSectionDeleteMutation($paymentMethodId: String!) {
    deletePaymentMethod(paymentMethodId: $paymentMethodId)
  }
`;

const PaymentMethodsSection: React.FC = () => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  
  const data = useLazyLoadQuery<any>(GET_PAYMENT_METHODS, {});
  const paymentMethods = data?.myPaymentMethods || [];
  
  const [setDefaultPaymentMethod] = useMutation(SET_DEFAULT_PAYMENT_METHOD);
  const [deletePaymentMethod] = useMutation(DELETE_PAYMENT_METHOD);
  
  const handleSetDefault = (paymentMethodId: string) => {
    setError(null);
    setSettingDefaultId(paymentMethodId);
    
    setDefaultPaymentMethod({
      variables: { paymentMethodId },
      onCompleted: () => {
        setSettingDefaultId(null);
      },
      onError: (err) => {
        setError(err.message);
        setSettingDefaultId(null);
      },
      updater: (store) => {
        // Update the store to reflect the new default
        const root = store.getRoot();
        const methods = root.getLinkedRecords('myPaymentMethods');
        if (methods) {
          methods.forEach(method => {
            if (method) {
              const id = method.getValue('id');
              method.setValue(id === paymentMethodId, 'isDefault');
            }
          });
        }
      }
    });
  };
  
  const handleDeleteClick = (paymentMethodId: string) => {
    setPendingDeleteId(paymentMethodId);
    setShowDeleteModal(true);
  };
  
  const handleDelete = () => {
    if (!pendingDeleteId) return;
    
    setError(null);
    setDeletingId(pendingDeleteId);
    setShowDeleteModal(false);
    
    deletePaymentMethod({
      variables: { paymentMethodId: pendingDeleteId },
      onCompleted: () => {
        setDeletingId(null);
        setPendingDeleteId(null);
      },
      onError: (err) => {
        setError(err.message);
        setDeletingId(null);
        setPendingDeleteId(null);
      },
      updater: (store) => {
        // Remove the deleted payment method from the store
        const root = store.getRoot();
        const methods = root.getLinkedRecords('myPaymentMethods');
        if (methods) {
          const filtered = methods.filter(method => 
            method && method.getValue('id') !== pendingDeleteId
          );
          root.setLinkedRecords(filtered, 'myPaymentMethods');
        }
      }
    });
  };
  
  if (paymentMethods.length === 0) {
    return (
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Payment Methods</h2>
        <p className={styles.emptyState}>
          No payment methods saved. Your payment methods will be saved when you create your first listing.
        </p>
      </div>
    );
  }
  
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Payment Methods</h2>
      
      {error && (
        <div className={styles.errorMessage}>{error}</div>
      )}
      
      <div className={styles.paymentMethodsList}>
        {paymentMethods.map((method: any) => (
          <div key={method.id} className={styles.paymentMethod}>
            <div className={styles.cardInfo}>
              <div className={styles.cardDetails}>
                <span className={styles.cardBrand}>
                  {method.brand}
                </span>
                <span className={styles.cardNumber}>•••• {method.last4}</span>
                <span className={styles.cardExpiry}>
                  Expires {method.expMonth.toString().padStart(2, '0')}/{method.expYear}
                </span>
              </div>
              {method.isDefault && (
                <span className={styles.defaultBadge}>Default</span>
              )}
            </div>
            
            <div className={styles.cardActions}>
              {!method.isDefault && (
                <Button
                  onClick={() => handleSetDefault(method.id)}
                  variant="secondary"
                  size="small"
                  disabled={settingDefaultId === method.id}
                >
                  {settingDefaultId === method.id ? 'Setting...' : 'Set as Default'}
                </Button>
              )}
              <Button
                onClick={() => handleDeleteClick(method.id)}
                variant="secondary"
                size="small"
                disabled={deletingId === method.id}
              >
                {deletingId === method.id ? 'Removing...' : 'Remove'}
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <p className={styles.helpText}>
        Payment methods are automatically saved when you create listings. 
        The default payment method will be pre-selected for new listings.
      </p>
      
      {showDeleteModal && (
        <div className={styles.deleteModal} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.deleteModalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.deleteModalTitle}>Remove Payment Method?</h3>
            <p className={styles.deleteModalText}>This payment method will be removed from your account.</p>
            <div className={styles.deleteModalActions}>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setPendingDeleteId(null);
                }}
                disabled={deletingId !== null}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleDelete}
                disabled={deletingId !== null}
                loading={deletingId !== null}
                style={{ background: '#000' }}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrapper with Suspense boundary
const PaymentMethodsSectionWrapper: React.FC = () => {
  return (
    <React.Suspense fallback={
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Payment Methods</h2>
        <div className={styles.loading}>Loading payment methods...</div>
      </div>
    }>
      <PaymentMethodsSection />
    </React.Suspense>
  );
};

export default PaymentMethodsSectionWrapper;