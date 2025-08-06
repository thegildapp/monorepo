import { useState } from 'react';
import { useMutation } from 'react-relay';
import { UpdateProfileMutation } from '../../queries/auth';
import type { authUpdateProfileMutation } from '../../__generated__/authUpdateProfileMutation.graphql';
import Button from '../common/Button';
import styles from './PhoneCollectionModal.module.css';

interface PhoneCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (phone: string) => void;
  userName?: string;
}

export default function PhoneCollectionModal({ isOpen, onClose, onSuccess, userName }: PhoneCollectionModalProps) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [commitUpdate, isUpdating] = useMutation<authUpdateProfileMutation>(UpdateProfileMutation);

  if (!isOpen) return null;

  // Format phone number for display
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else if (phoneNumber.length <= 10) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
    } else {
      // Handle international format with country code
      return `+${phoneNumber.slice(0, phoneNumber.length - 10)} (${phoneNumber.slice(-10, -7)}) ${phoneNumber.slice(-7, -4)}-${phoneNumber.slice(-4)}`;
    }
  };

  // Handle phone input change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Allow only digits, spaces, parentheses, hyphens, and plus sign
    const cleaned = input.replace(/[^\d\s()\-+]/g, '');
    
    // If user is deleting, allow the raw input
    if (input.length < phone.length) {
      setPhone(cleaned);
      return;
    }
    
    // Get just the digits for formatting
    const digits = cleaned.replace(/\D/g, '');
    
    // Limit to reasonable phone number length (15 digits max for international)
    if (digits.length <= 15) {
      setPhone(formatPhoneNumber(digits));
    }
  };

  // Validate phone number
  const validatePhone = (phoneNumber: string): boolean => {
    const digits = phoneNumber.replace(/\D/g, '');
    return digits.length >= 10;
  };

  const handleSave = () => {
    setError('');

    if (!validatePhone(phone)) {
      setError('Please enter a valid phone number (at least 10 digits)');
      return;
    }

    // Clean phone number to store only digits
    const cleanedPhone = phone.replace(/\D/g, '');

    commitUpdate({
      variables: {
        input: {
          phone: cleanedPhone,
        },
      },
      onCompleted: (response) => {
        if (response.updateProfile) {
          // Pass the cleaned phone back to parent
          onSuccess(cleanedPhone);
        }
      },
      onError: (error) => {
        setError(error.message);
      },
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Add Your Phone Number</h2>
        <p className={styles.modalDescription}>
          To accept this inquiry, please provide your phone number. 
          It will be shared with the buyer so they can contact you.
        </p>

        <div className={styles.inputContainer}>
          <input
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="(555) 555-5555"
            className={styles.phoneInput}
            autoFocus
          />
          {error && <div className={styles.error}>{error}</div>}
        </div>

        <div className={styles.buttonContainer}>
          <Button
            onClick={onClose}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="primary"
            disabled={isUpdating || !phone}
            loading={isUpdating}
          >
            Save & Accept Inquiry
          </Button>
        </div>

        <p className={styles.privacyNote}>
          Your phone number will be saved to your profile for future inquiries.
        </p>
      </div>
    </div>
  );
}