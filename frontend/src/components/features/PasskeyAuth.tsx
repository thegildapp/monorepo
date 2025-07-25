import { useState, useEffect } from 'react';
import { useMutation } from 'react-relay';
import { graphql } from 'react-relay';
import { 
  isPasskeySupported, 
  isPasskeyAvailable, 
  registerPasskey,
  authenticateWithPasskey 
} from '../../utils/webauthn';
import { useAuth } from '../../contexts/AuthContext';
import styles from './PasskeyAuth.module.css';

// GraphQL mutations
const START_PASSKEY_REGISTRATION = graphql`
  mutation PasskeyAuthStartRegistrationMutation($email: String!, $name: String!) {
    startPasskeyRegistration(email: $email, name: $name) {
      publicKey
    }
  }
`;

const COMPLETE_PASSKEY_REGISTRATION = graphql`
  mutation PasskeyAuthCompleteRegistrationMutation($input: CompletePasskeyRegistrationInput!) {
    completePasskeyRegistration(input: $input) {
      token
      user {
        id
        email
        name
        phone
        avatarUrl
      }
    }
  }
`;

const CREATE_AUTH_OPTIONS = graphql`
  mutation PasskeyAuthCreateAuthOptionsMutation($email: String!) {
    createPasskeyAuthenticationOptions(email: $email) {
      publicKey
    }
  }
`;

const VERIFY_AUTH = graphql`
  mutation PasskeyAuthVerifyMutation($input: VerifyPasskeyAuthenticationInput!) {
    verifyPasskeyAuthentication(input: $input) {
      token
      user {
        id
        email
        name
        phone
        avatarUrl
      }
    }
  }
`;

interface PasskeyAuthProps {
  onShowPassword: () => void;
}

export default function PasskeyAuth({ onShowPassword }: PasskeyAuthProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [supported, setSupported] = useState(false);
  const [available, setAvailable] = useState(false);
  
  const [commitStartRegistration] = useMutation(START_PASSKEY_REGISTRATION);
  const [commitCompleteRegistration] = useMutation(COMPLETE_PASSKEY_REGISTRATION);
  const [commitCreateAuthOptions] = useMutation(CREATE_AUTH_OPTIONS);
  const [commitVerifyAuth] = useMutation(VERIFY_AUTH);
  
  useEffect(() => {
    const checkSupport = () => {
      const isSupported = isPasskeySupported();
      setSupported(isSupported);
      
      if (!isSupported) {
        // Use setTimeout to avoid state update during render
        setTimeout(() => onShowPassword(), 0);
      } else {
        isPasskeyAvailable().then(setAvailable);
      }
    };
    
    checkSupport();
  }, [onShowPassword]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Try authentication first
      commitCreateAuthOptions({
        variables: { email },
        onCompleted: async (response) => {
          try {
            const options = JSON.parse(response.createPasskeyAuthenticationOptions.publicKey);
            const authResponse = await authenticateWithPasskey(options);
            
            commitVerifyAuth({
              variables: {
                input: {
                  email,
                  response: JSON.stringify(authResponse),
                },
              },
              onCompleted: (verifyResponse) => {
                if (verifyResponse.verifyPasskeyAuthentication) {
                  login(
                    verifyResponse.verifyPasskeyAuthentication.token,
                    verifyResponse.verifyPasskeyAuthentication.user
                  );
                }
              },
              onError: (error) => {
                setError(error.message);
                setIsLoading(false);
              },
            });
          } catch (error: any) {
            if (error.name === 'NotAllowedError') {
              setError('Authentication was cancelled');
            } else {
              setError('Authentication failed');
            }
            setIsLoading(false);
          }
        },
        onError: (error) => {
          // Handle different error cases
          if (error.message.includes('No passkeys found')) {
            // Existing user without passkeys - prompt to use password
            setError('No passkeys found for this account. Please use password to sign in.');
            setIsLoading(false);
          } else if (error.message.includes('User not found')) {
            // New user - switch to registration
            setIsRegistering(true);
            setIsLoading(false);
          } else {
            setError(error.message);
            setIsLoading(false);
          }
        },
      });
    } catch (error) {
      setError('An error occurred');
      setIsLoading(false);
    }
  };
  
  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      commitStartRegistration({
        variables: { email, name },
        onCompleted: async (response) => {
          try {
            const options = JSON.parse(response.startPasskeyRegistration.publicKey);
            const regResponse = await registerPasskey(options);
            
            commitCompleteRegistration({
              variables: {
                input: {
                  email,
                  name,
                  response: JSON.stringify(regResponse),
                },
              },
              onCompleted: (completeResponse) => {
                if (completeResponse.completePasskeyRegistration) {
                  login(
                    completeResponse.completePasskeyRegistration.token,
                    completeResponse.completePasskeyRegistration.user
                  );
                }
              },
              onError: (error) => {
                setError(error.message);
                setIsLoading(false);
              },
            });
          } catch (error: any) {
            if (error.name === 'NotAllowedError') {
              setError('Registration was cancelled');
            } else {
              setError('Registration failed. Please try again.');
            }
            setIsLoading(false);
          }
        },
        onError: (error) => {
          setError(error.message);
          setIsLoading(false);
        },
      });
    } catch (error) {
      setError('An error occurred');
      setIsLoading(false);
    }
  };
  
  if (!supported) {
    // Don't render anything if passkeys aren't supported
    // The useEffect will handle redirecting to password auth
    return null;
  }
  
  return (
    <div className={styles.container}>
      <form onSubmit={isRegistering ? handleRegistration : handleSubmit} className={styles.form}>
        <h1 className={styles.title}>Welcome to Gild</h1>
        
        {!isRegistering ? (
          <>
            <p className={styles.subtitle}>
              Sign in or create an account
            </p>
            
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className={styles.input}
              autoFocus
            />
            
            {error && <div className={styles.error}>{error}</div>}
            
            <button
              type="submit"
              disabled={isLoading || !email}
              className={styles.primaryButton}
            >
              {isLoading ? 'Loading...' : 'Continue'}
            </button>
            
            <button
              type="button"
              onClick={onShowPassword}
              className={styles.linkButton}
            >
              Use password instead
            </button>
          </>
        ) : (
          <>
            <p className={styles.subtitle}>
              Looks like you're new! Let's create your account.
            </p>
            
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className={styles.input}
              autoFocus
            />
            
            <input
              type="email"
              value={email}
              disabled
              className={styles.input}
            />
            
            {error && <div className={styles.error}>{error}</div>}
            
            <button
              type="submit"
              disabled={isLoading || !name}
              className={styles.primaryButton}
            >
              {isLoading ? 'Setting up...' : 'Create account'}
            </button>
            
            <button
              type="button"
              onClick={() => {
                setIsRegistering(false);
                setName('');
                setError('');
              }}
              className={styles.linkButton}
            >
              Use a different email
            </button>
          </>
        )}
      </form>
    </div>
  );
}