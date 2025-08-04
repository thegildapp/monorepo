import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, graphql } from 'react-relay';
import Layout from '../layout/Layout';
import Main from '../layout/Main';
import Header from '../layout/Header';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterMutation } from '../../queries/auth';
import { 
  isPasskeySupported,
  registerPasskey
} from '../../utils/webauthn';
import type { authRegisterMutation } from '../../__generated__/authRegisterMutation.graphql';
import styles from './AuthPage.module.css';

const START_PASSKEY_REGISTRATION = graphql`
  mutation SignUpPageStartRegistrationMutation($email: String!, $name: String!) {
    startPasskeyRegistration(email: $email, name: $name) {
      publicKey
      errors {
        field
        message
        code
      }
    }
  }
`;

const COMPLETE_PASSKEY_REGISTRATION = graphql`
  mutation SignUpPageCompleteRegistrationMutation($input: CompletePasskeyRegistrationInput!) {
    completePasskeyRegistration(input: $input) {
      token
      user {
        id
        email
        name
        phone
        avatarUrl
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

export default function SignUpPage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [passkeySupported, setPasskeySupported] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const [commitRegister, isRegisterInFlight] = useMutation<authRegisterMutation>(RegisterMutation);
  const [commitStartPasskeyReg] = useMutation(START_PASSKEY_REGISTRATION);
  const [commitCompletePasskeyReg] = useMutation(COMPLETE_PASSKEY_REGISTRATION);

  useEffect(() => {
    if (user) {
      navigate('/me', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    setPasskeySupported(isPasskeySupported());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Don't do anything if password field isn't visible yet
    if (!showPassword) {
      return;
    }

    commitRegister({
      variables: {
        input: {
          email,
          password,
          name,
          phone: null,
        },
      },
      onCompleted: (response) => {
        if (response.register && response.register.errors && response.register.errors.length > 0) {
          const error = response.register.errors[0];
          setError(error.message);
        } else if (response.register && response.register.token && response.register.user) {
          // Normal flow (shouldn't happen with email verification)
          login(response.register.token, response.register.user);
          navigate('/me', { replace: true });
        } else if (response.register && !response.register.errors) {
          // Email verification required only if no errors
          setEmailSent(true);
        }
      },
      onError: (error) => {
        if (error.message.includes('Failed to fetch')) {
          setError('Unable to connect. Please check your connection and try again.');
        } else {
          const errorMessage = error.source?.errors?.[0]?.message || error.message;
          setError(errorMessage);
        }
      },
    });
  };

  const handlePasskeyRegistration = async () => {
    if (!email || !name) {
      setError('Please enter your name and email first');
      return;
    }

    setError('');
    
    commitStartPasskeyReg({
      variables: { email, name },
      onCompleted: async (response) => {
        if (response.startPasskeyRegistration && response.startPasskeyRegistration.errors && response.startPasskeyRegistration.errors.length > 0) {
          const error = response.startPasskeyRegistration.errors[0];
          setError(error.message);
          return;
        }
        
        if (!response.startPasskeyRegistration?.publicKey) {
          setError('Unable to start registration');
          return;
        }
        
        try {
          const options = JSON.parse(response.startPasskeyRegistration.publicKey);
          const regResponse = await registerPasskey(options);
          
          commitCompletePasskeyReg({
            variables: {
              input: {
                email,
                name,
                response: JSON.stringify(regResponse),
              },
            },
            onCompleted: (completeResponse) => {
              if (completeResponse.completePasskeyRegistration && completeResponse.completePasskeyRegistration.errors && completeResponse.completePasskeyRegistration.errors.length > 0) {
                const error = completeResponse.completePasskeyRegistration.errors[0];
                setError(error.message);
              } else if (completeResponse.completePasskeyRegistration && 
                  completeResponse.completePasskeyRegistration.token && 
                  completeResponse.completePasskeyRegistration.user) {
                // Normal flow (shouldn't happen with email verification)
                login(
                  completeResponse.completePasskeyRegistration.token,
                  completeResponse.completePasskeyRegistration.user
                );
              } else {
                // Email verification required
                setEmailSent(true);
              }
            },
            onError: (error) => {
              if (error.message.includes('Failed to fetch')) {
                setError('Unable to connect. Please check your connection and try again.');
              } else {
                const errorMessage = error.source?.errors?.[0]?.message || error.message;
                setError(errorMessage);
              }
            },
          });
        } catch (error: any) {
          if (error.name === 'NotAllowedError') {
            setError('Passkey setup was cancelled');
          } else {
            setError('Passkey setup failed. Please try password instead.');
          }
        }
      },
      onError: (error) => {
        if (error.message.includes('Failed to fetch')) {
          setError('Unable to connect. Please check your connection and try again.');
        } else {
          setError('An error occurred. Please try again.');
        }
      },
    });
  };

  const isLoading = isRegisterInFlight;

  return (
    <Layout>
      <Header logoText="Gild" showSearch={false} />
      <Main>
        <div className={styles.container}>
          {emailSent ? (
            <div className={styles.emailSentContainer}>
              <h1 className={styles.title}>Check your email</h1>
              <p className={styles.message}>
                We've sent a verification link to {email}
              </p>
              <p className={styles.message}>
                Click the link in the email to complete your registration.
              </p>
              <Link to="/signin" className={styles.linkButton}>
                Back to sign in
              </Link>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className={styles.input}
              autoFocus
            />
            
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className={styles.input}
            />
            
            {(showPassword || !passkeySupported) && (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className={styles.input}
              />
            )}
            
            {error && <div className={styles.error}>{error}</div>}
            
            {!showPassword && passkeySupported && (
              <>
                <button
                  type="button"
                  onClick={handlePasskeyRegistration}
                  className={styles.primaryButton}
                >
                  <img 
                    src="/passkey-icon.svg" 
                    alt="Passkey" 
                    style={{ width: '20px', height: '20px', marginRight: '8px', verticalAlign: 'middle', filter: 'invert(1)' }}
                  />
                  Create account with passkey
                </button>
                <button
                  type="button"
                  onClick={() => setShowPassword(true)}
                  className={styles.secondaryButton}
                >
                  Use password instead
                </button>
              </>
            )}
            
            {(showPassword || !passkeySupported) && (
              <button
                type="submit"
                disabled={isLoading}
                className={styles.primaryButton}
              >
                {isLoading ? 'Loading...' : 'Create account'}
              </button>
            )}
            
            <Link to="/signin" className={styles.linkButton}>
              Already have an account? Sign in
            </Link>
          </form>
          )}
        </div>
      </Main>
    </Layout>
  );
}