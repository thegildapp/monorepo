import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, graphql } from 'react-relay';
import Layout from '../layout/Layout';
import Main from '../layout/Main';
import Header from '../layout/Header';
import { useAuth } from '../../contexts/AuthContext';
import { LoginMutation, RegisterMutation } from '../../queries/auth';
import { 
  isPasskeySupported,
  authenticateWithPasskey,
  registerPasskey
} from '../../utils/webauthn';
import type { authLoginMutation } from '../../__generated__/authLoginMutation.graphql';
import type { authRegisterMutation } from '../../__generated__/authRegisterMutation.graphql';
import styles from './AuthPage.module.css';

const CREATE_AUTH_OPTIONS = graphql`
  mutation AuthPageCreateAuthOptionsMutation($email: String!) {
    createPasskeyAuthenticationOptions(email: $email) {
      publicKey
    }
  }
`;

const VERIFY_AUTH = graphql`
  mutation AuthPageVerifyMutation($input: VerifyPasskeyAuthenticationInput!) {
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

const START_PASSKEY_REGISTRATION = graphql`
  mutation AuthPageStartRegistrationMutation($email: String!, $name: String!) {
    startPasskeyRegistration(email: $email, name: $name) {
      publicKey
    }
  }
`;

const COMPLETE_PASSKEY_REGISTRATION = graphql`
  mutation AuthPageCompleteRegistrationMutation($input: CompletePasskeyRegistrationInput!) {
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

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [error, setError] = useState('');
  const [passkeySupported, setPasskeySupported] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [commitLogin, isLoginInFlight] = useMutation<authLoginMutation>(LoginMutation);
  const [commitRegister, isRegisterInFlight] = useMutation<authRegisterMutation>(RegisterMutation);
  const [commitCreateAuthOptions] = useMutation(CREATE_AUTH_OPTIONS);
  const [commitVerifyAuth] = useMutation(VERIFY_AUTH);
  const [commitStartPasskeyReg] = useMutation(START_PASSKEY_REGISTRATION);
  const [commitCompletePasskeyReg] = useMutation(COMPLETE_PASSKEY_REGISTRATION);

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

    if (isNewUser) {
      // Create account
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
          if (response.register) {
            login(response.register.token, response.register.user);
            navigate(from, { replace: true });
          }
        },
        onError: (error) => {
          if (error.message.includes('Failed to fetch')) {
            setError('Unable to connect. Please check your connection and try again.');
          } else {
            setError(error.message);
          }
        },
      });
    } else {
      // Sign in
      commitLogin({
        variables: {
          input: { email, password },
        },
        onCompleted: (response) => {
          if (response.login) {
            login(response.login.token, response.login.user);
            navigate(from, { replace: true });
          }
        },
        onError: (error) => {
          if (error.message.includes('Failed to fetch')) {
            setError('Unable to connect. Please check your connection and try again.');
          } else if (error.message.includes('Invalid email or password')) {
            // Maybe they need to create an account
            setError("Can't find that account. Create one below.");
            setIsNewUser(true);
          } else {
            setError(error.message);
          }
        },
      });
    }
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
              if (error.message.includes('Failed to fetch')) {
                setError('Unable to connect. Please check your connection and try again.');
              } else {
                setError('Authentication failed. Try password instead.');
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
        } else if (error.message.includes('No passkeys')) {
          setError('No passkeys found. Please use password.');
        } else if (error.message.includes('User not found')) {
          setError('No account found. Please create one first.');
          setIsNewUser(true);
        } else {
          setError('An error occurred');
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
              if (completeResponse.completePasskeyRegistration) {
                login(
                  completeResponse.completePasskeyRegistration.token,
                  completeResponse.completePasskeyRegistration.user
                );
              }
            },
            onError: (error) => {
              if (error.message.includes('Failed to fetch')) {
                setError('Unable to connect. Please check your connection and try again.');
              } else {
                setError(error.message);
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
        } else if (error.message.includes('already exists')) {
          setError('An account with this email already exists. Please sign in.');
          setIsNewUser(false);
        } else {
          setError(error.message);
        }
      },
    });
  };

  const isLoading = isLoginInFlight || isRegisterInFlight;

  return (
    <Layout>
      <Header logoText="Gild" showSearch={false} />
      <Main>
        <div className={styles.container}>
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <h1 className={styles.title}>Welcome to Gild</h1>
            
            {isNewUser && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className={styles.input}
                autoFocus
              />
            )}
            
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className={styles.input}
              autoFocus={!isNewUser}
            />
            
            {(showPassword || (isNewUser && !passkeySupported)) && (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className={styles.input}
              />
            )}
            
            {error && <div className={styles.error}>{error}</div>}
            
            {!isNewUser && !showPassword && (
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
                  type="submit"
                  className={passkeySupported ? styles.secondaryButton : styles.primaryButton}
                >
                  Continue with password
                </button>
              </>
            )}
            
            {showPassword && !isNewUser && (
              <button
                type="submit"
                disabled={isLoading}
                className={styles.primaryButton}
              >
                {isLoading ? 'Loading...' : 'Sign in'}
              </button>
            )}
            
            {isNewUser && (
              <>
                {passkeySupported && (
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
                )}
                <button
                  type="submit"
                  className={passkeySupported ? styles.secondaryButton : styles.primaryButton}
                >
                  {passkeySupported ? 'Use password instead' : 'Create account'}
                </button>
              </>
            )}
            
            <button
              type="button"
              onClick={() => {
                setIsNewUser(!isNewUser);
                setError('');
                setName('');
                setShowPassword(false);
              }}
              className={styles.linkButton}
            >
              {isNewUser ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
            </button>
          </form>
        </div>
      </Main>
    </Layout>
  );
}