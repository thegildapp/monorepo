import { useState, useEffect } from 'react';
import { useMutation } from 'react-relay';
import { 
  isPasskeySupported, 
  isPasskeyAvailable, 
  registerPasskey 
} from '../../utils/webauthn';
import {
  CREATE_PASSKEY_REGISTRATION_OPTIONS,
  VERIFY_PASSKEY_REGISTRATION,
  DELETE_PASSKEY
} from '../../queries/passkey';
import styles from './PasskeyManager.module.css';

interface Passkey {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
}

interface PasskeyManagerProps {
  passkeys: Passkey[];
  onPasskeyAdded?: () => void;
  onPasskeyDeleted?: () => void;
}

export default function PasskeyManager({ passkeys, onPasskeyAdded, onPasskeyDeleted }: PasskeyManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const [passkeyName, setPasskeyName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [supported, setSupported] = useState(false);
  const [available, setAvailable] = useState(false);
  
  const [commitRegOptions] = useMutation(CREATE_PASSKEY_REGISTRATION_OPTIONS);
  const [commitVerifyReg] = useMutation(VERIFY_PASSKEY_REGISTRATION);
  const [commitDelete] = useMutation(DELETE_PASSKEY);
  
  // Check passkey support
  useEffect(() => {
    setSupported(isPasskeySupported());
    isPasskeyAvailable().then(setAvailable);
  }, []);
  
  const handleAddPasskey = async () => {
    if (!showNameInput) {
      setShowNameInput(true);
      return;
    }
    
    setIsAdding(true);
    setError('');
    
    try {
      // Get registration options
      commitRegOptions({
        variables: {},
        onCompleted: async (response) => {
          try {
            const options = JSON.parse(response.createPasskeyRegistrationOptions.publicKey);
            
            // Start registration
            const regResponse = await registerPasskey(options);
            
            // Verify registration
            commitVerifyReg({
              variables: {
                input: {
                  response: JSON.stringify(regResponse),
                  name: passkeyName || undefined,
                },
              },
              onCompleted: () => {
                setShowNameInput(false);
                setPasskeyName('');
                setIsAdding(false);
                if (onPasskeyAdded) {
                  onPasskeyAdded();
                }
              },
              onError: (error) => {
                setError(error.message);
                setIsAdding(false);
              },
            });
          } catch (error: any) {
            if (error.name === 'NotAllowedError') {
              setError('Registration was cancelled or not allowed');
            } else {
              setError('Failed to register passkey');
            }
            setIsAdding(false);
          }
        },
        onError: (error) => {
          setError(error.message);
          setIsAdding(false);
        },
      });
    } catch (error) {
      setError('Failed to start passkey registration');
      setIsAdding(false);
    }
  };
  
  const handleDeletePasskey = (id: string) => {
    if (!confirm('Are you sure you want to delete this passkey?')) {
      return;
    }
    
    commitDelete({
      variables: { id },
      onCompleted: () => {
        if (onPasskeyDeleted) {
          onPasskeyDeleted();
        }
      },
      onError: (error) => {
        setError(error.message);
      },
    });
  };
  
  if (!supported) {
    return null;
  }
  
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Passkeys</h3>
      <p className={styles.description}>
        Sign in faster and more securely with passkeys
      </p>
      
      {passkeys.length > 0 && (
        <div className={styles.passkeyList}>
          {passkeys.map((passkey) => (
            <div key={passkey.id} className={styles.passkeyItem}>
              <div className={styles.passkeyInfo}>
                <div className={styles.passkeyName}>{passkey.name}</div>
                <div className={styles.passkeyMeta}>
                  Added {new Date(passkey.createdAt).toLocaleDateString()}
                  {passkey.lastUsedAt && (
                    <> • Last used {new Date(passkey.lastUsedAt).toLocaleDateString()}</>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDeletePasskey(passkey.id)}
                className={styles.deleteButton}
                aria-label="Delete passkey"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      
      {error && <div className={styles.error}>{error}</div>}
      
      {showNameInput ? (
        <div className={styles.nameInput}>
          <input
            type="text"
            value={passkeyName}
            onChange={(e) => setPasskeyName(e.target.value)}
            placeholder="Passkey name (e.g., MacBook Pro)"
            className={styles.input}
            autoFocus
          />
          <div className={styles.buttonGroup}>
            <button
              onClick={handleAddPasskey}
              disabled={isAdding}
              className={styles.addButton}
            >
              {isAdding ? 'Adding...' : 'Add'}
            </button>
            <button
              onClick={() => {
                setShowNameInput(false);
                setPasskeyName('');
                setError('');
              }}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleAddPasskey}
          disabled={isAdding}
          className={styles.addButton}
        >
          Add a passkey
        </button>
      )}
      
      {available && !showNameInput && (
        <p className={styles.hint}>
          Your device supports Face ID, Touch ID, or biometric authentication
        </p>
      )}
    </div>
  );
}