import { useState } from 'react';
import { useMutation } from 'react-relay';
import { 
  isPasskeySupported, 
  isPasskeyAvailable, 
  authenticateWithPasskey 
} from '../../utils/webauthn';
import {
  CREATE_PASSKEY_AUTHENTICATION_OPTIONS,
  VERIFY_PASSKEY_AUTHENTICATION
} from '../../queries/passkey';
import styles from './PasskeySignIn.module.css';

interface PasskeySignInProps {
  onSuccess: (token: string, user: any) => void;
  onError: (error: string) => void;
}

export default function PasskeySignIn({ onSuccess, onError }: PasskeySignInProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  
  const [commitAuthOptions] = useMutation(CREATE_PASSKEY_AUTHENTICATION_OPTIONS);
  const [commitVerifyAuth] = useMutation(VERIFY_PASSKEY_AUTHENTICATION);
  
  const handlePasskeySignIn = async () => {
    if (!email && !showEmailInput) {
      setShowEmailInput(true);
      return;
    }
    
    if (!email) {
      onError('Please enter your email');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get authentication options
      commitAuthOptions({
        variables: { email },
        onCompleted: async (response) => {
          try {
            const options = JSON.parse(response.createPasskeyAuthenticationOptions.publicKey);
            
            // Start authentication
            const authResponse = await authenticateWithPasskey(options);
            
            // Verify authentication
            commitVerifyAuth({
              variables: {
                input: {
                  email,
                  response: JSON.stringify(authResponse),
                },
              },
              onCompleted: (verifyResponse) => {
                if (verifyResponse.verifyPasskeyAuthentication) {
                  onSuccess(
                    verifyResponse.verifyPasskeyAuthentication.token,
                    verifyResponse.verifyPasskeyAuthentication.user
                  );
                }
              },
              onError: (error) => {
                onError(error.message);
                setIsLoading(false);
              },
            });
          } catch (error: any) {
            if (error.name === 'NotAllowedError') {
              onError('Authentication was cancelled or not allowed');
            } else {
              onError('Passkey authentication failed');
            }
            setIsLoading(false);
          }
        },
        onError: (error) => {
          onError(error.message);
          setIsLoading(false);
        },
      });
    } catch (error) {
      onError('Failed to start passkey authentication');
      setIsLoading(false);
    }
  };
  
  const [supported, setSupported] = useState(false);
  const [available, setAvailable] = useState(false);
  
  // Check passkey support
  useState(() => {
    setSupported(isPasskeySupported());
    isPasskeyAvailable().then(setAvailable);
  });
  
  if (!supported) {
    return null;
  }
  
  return (
    <div className={styles.container}>
      {showEmailInput ? (
        <div className={styles.emailInput}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className={styles.input}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handlePasskeySignIn();
              }
            }}
          />
          <button
            onClick={handlePasskeySignIn}
            disabled={isLoading || !email}
            className={styles.button}
          >
            {isLoading ? 'Authenticating...' : 'Continue'}
          </button>
        </div>
      ) : (
        <button
          onClick={handlePasskeySignIn}
          disabled={isLoading}
          className={styles.passkeyButton}
        >
          {isLoading ? 'Authenticating...' : 'Sign in with Passkey'}
        </button>
      )}
      
      {available && (
        <p className={styles.hint}>
          Use Face ID, Touch ID, or your device security
        </p>
      )}
    </div>
  );
}