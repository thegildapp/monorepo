import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useMutation, graphql } from 'react-relay';
import Layout from '../layout/Layout';
import Main from '../layout/Main';
import Header from '../layout/Header';
import { useAuth } from '../../contexts/AuthContext';
import { LoginMutation } from '../../queries/auth';
import { 
  isPasskeySupported,
  authenticateWithPasskey,
} from '../../utils/webauthn';
import type { authLoginMutation } from '../../__generated__/authLoginMutation.graphql';
import styles from './AuthPage.module.css';

const CREATE_AUTH_OPTIONS = graphql`
  mutation SignInPageCreateAuthOptionsMutation($email: String!) {
    createPasskeyAuthenticationOptions(email: $email) {
      publicKey
      errors {
        field
        message
        code
      }
    }
  }
`;

const VERIFY_AUTH = graphql`
  mutation SignInPageVerifyMutation($input: VerifyPasskeyAuthenticationInput!) {
    verifyPasskeyAuthentication(input: $input) {
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

export default function SignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [passkeySupported, setPasskeySupported] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const [commitLogin, isLoginInFlight] = useMutation<authLoginMutation>(LoginMutation);
  const [commitCreateAuthOptions] = useMutation(CREATE_AUTH_OPTIONS);
  const [commitVerifyAuth] = useMutation(VERIFY_AUTH);

  const from = (location.state as any)?.from || '/me';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

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

    commitLogin({
      variables: {
        input: { email, password },
      },
      onCompleted: (response) => {
        if (response.login && response.login.errors && response.login.errors.length > 0) {
          const error = response.login.errors[0];
          setError(error.message);
          if (error.code === 'EMAIL_NOT_VERIFIED') {
            // Show email verification page
            setEmailSent(true);
          }
        } else if (response.login && response.login.token && response.login.user) {
          login(response.login.token, response.login.user);
          navigate(from, { replace: true });
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

  const handlePasskeySignIn = async () => {
    if (!email) {
      setError('Please enter your email first');
      return;
    }

    setError('');
    
    commitCreateAuthOptions({
      variables: { email },
      onCompleted: async (response) => {
        if (response.createPasskeyAuthenticationOptions && response.createPasskeyAuthenticationOptions.errors && response.createPasskeyAuthenticationOptions.errors.length > 0) {
          const error = response.createPasskeyAuthenticationOptions.errors[0];
          setError(error.message);
          return;
        }
        
        if (!response.createPasskeyAuthenticationOptions?.publicKey) {
          setError('Unable to start authentication');
          return;
        }
        
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
              if (verifyResponse.verifyPasskeyAuthentication && verifyResponse.verifyPasskeyAuthentication.errors && verifyResponse.verifyPasskeyAuthentication.errors.length > 0) {
                const error = verifyResponse.verifyPasskeyAuthentication.errors[0];
                setError(error.message);
              } else if (verifyResponse.verifyPasskeyAuthentication && verifyResponse.verifyPasskeyAuthentication.token && verifyResponse.verifyPasskeyAuthentication.user) {
                login(
                  verifyResponse.verifyPasskeyAuthentication.token,
                  verifyResponse.verifyPasskeyAuthentication.user
                );
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
        } catch (error: any) {
          if (error.name === 'NotAllowedError') {
            setError('Authentication was cancelled');
          } else {
            setError('Authentication failed');
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

  const isLoading = isLoginInFlight;

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
              <button
                type="button"
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                  setPassword('');
                  setShowPassword(false);
                }}
                className={styles.linkButton}
              >
                Back to sign in
              </button>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className={styles.input}
              autoFocus
            />
            
            {showPassword && (
              <div style={{ position: 'relative' }}>
                <input
                  type={showPasswordText ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className={styles.input}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordText(!showPasswordText)}
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'Tinos, Georgia, serif',
                  }}
                  aria-label={showPasswordText ? 'Hide password' : 'Show password'}
                >
                  {showPasswordText ? 'Hide' : 'Show'}
                </button>
              </div>
            )}
            
            {error && <div className={styles.error}>{error}</div>}
            
            {!showPassword && (
              <>
                {passkeySupported && (
                  <button
                    type="button"
                    onClick={handlePasskeySignIn}
                    className={styles.primaryButton}
                  >
                    <img 
                      src="/passkey-icon.svg" 
                      alt="Passkey" 
                      style={{ width: '20px', height: '20px', marginRight: '8px', verticalAlign: 'middle', filter: 'invert(1)' }}
                    />
                    Sign in with passkey
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(true)}
                  className={passkeySupported ? styles.secondaryButton : styles.primaryButton}
                >
                  Continue with password
                </button>
              </>
            )}
            
            {showPassword && (
              <>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={styles.primaryButton}
                >
                  {isLoading ? 'Loading...' : 'Sign in'}
                </button>
                <Link to="/forgot-password" className={styles.linkButton}>
                  Forgot your password?
                </Link>
              </>
            )}
            
            <Link to="/signup" className={styles.linkButton}>
              Don't have an account? Create one
            </Link>
            {!showPassword && (
              <Link to="/forgot-password" className={styles.linkButton} style={{ marginTop: '8px' }}>
                Can't sign in?
              </Link>
            )}
          </form>
          )}
        </div>
      </Main>
    </Layout>
  );
}