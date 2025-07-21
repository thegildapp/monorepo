import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from 'react-relay';
import Layout from '../layout/Layout';
import Main from '../layout/Main';
import Header from '../layout/Header';
import { useAuth } from '../../contexts/AuthContext';
import { LoginMutation, RegisterMutation } from '../../queries/auth';
import type { authLoginMutation } from '../../__generated__/authLoginMutation.graphql';
import type { authRegisterMutation } from '../../__generated__/authRegisterMutation.graphql';
import styles from './SignInPage.module.css';

export default function SignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const [commitLogin, isLoginInFlight] = useMutation<authLoginMutation>(LoginMutation);
  const [commitRegister, isRegisterInFlight] = useMutation<authRegisterMutation>(RegisterMutation);

  // Get the intended destination from location state
  const from = (location.state as any)?.from || '/me';
  
  // Redirect if already signed in
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignUp) {
      commitRegister({
        variables: {
          input: {
            email,
            password,
            name,
            phone: phone || null,
          },
        },
        onCompleted: (response) => {
          if (response.register) {
            login(response.register.token, response.register.user);
            navigate(from, { replace: true });
          }
        },
        onError: (error) => {
          setError(error.message);
        },
      });
    } else {
      commitLogin({
        variables: {
          input: {
            email,
            password,
          },
        },
        onCompleted: (response) => {
          if (response.login) {
            login(response.login.token, response.login.user);
            navigate(from, { replace: true });
          }
        },
        onError: (error) => {
          setError(error.message);
        },
      });
    }
  };

  const isLoading = isLoginInFlight || isRegisterInFlight;

  return (
    <Layout>
      <Header logoText="Gild" showSearch={false} />
      <Main>
        <div className={styles.container}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {isSignUp && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                required
                className={styles.input}
                autoFocus
              />
            )}

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className={styles.input}
              autoFocus={!isSignUp}
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              className={styles.input}
            />

            {isSignUp && (
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone (optional)"
                className={styles.input}
              />
            )}

            {error && (
              <div className={styles.error}>{error}</div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitButton}
            >
              {isLoading ? '...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
            
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className={styles.switchButton}
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </Main>
    </Layout>
  );
}