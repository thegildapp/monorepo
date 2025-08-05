import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, graphql } from 'react-relay';
import Layout from '../layout/Layout';
import Main from '../layout/Main';
import Header from '../layout/Header';
import styles from './AuthPage.module.css';
import type { ForgotPasswordPageRequestPasswordResetMutation } from '../../__generated__/ForgotPasswordPageRequestPasswordResetMutation.graphql';

const REQUEST_PASSWORD_RESET_MUTATION = graphql`
  mutation ForgotPasswordPageRequestPasswordResetMutation($email: String!) {
    requestPasswordReset(email: $email) {
      success
      message
      errors {
        field
        message
        code
      }
    }
  }
`;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [commit] = useMutation<ForgotPasswordPageRequestPasswordResetMutation>(REQUEST_PASSWORD_RESET_MUTATION);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    
    commit({
      variables: { email },
      onCompleted: (response) => {
        setIsLoading(false);
        if (response.requestPasswordReset.success) {
          setShowSuccess(true);
          setError(null);
        } else if (response.requestPasswordReset.errors && response.requestPasswordReset.errors.length > 0) {
          const firstError = response.requestPasswordReset.errors[0];
          setError(firstError.message);
        }
      },
      onError: (error) => {
        setIsLoading(false);
        console.error('Password reset request failed:', error);
        setError('An error occurred. Please try again later.');
      }
    });
  };

  if (showSuccess) {
    return (
      <Layout>
        <Header logoText="Gild" showSearch={false} />
        <Main>
          <div className={styles.container}>
            <div className={styles.form}>
              <h1 className={styles.title}>Check your email</h1>
              <p className={styles.subtitle}>
                If an account exists with {email}, you'll receive a password reset link shortly.
              </p>
              <Link to="/signin" className={styles.linkButton}>
                Back to sign in
              </Link>
            </div>
          </div>
        </Main>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header logoText="Gild" showSearch={false} />
      <Main>
        <div className={styles.container}>
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <h1 className={styles.title}>Can't sign in?</h1>
            <p className={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your password or add a new passkey.
            </p>
            
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className={styles.input}
              autoFocus
              autoComplete="email"
              disabled={isLoading}
            />
            
            {error && <div className={styles.error}>{error}</div>}
            
            <button
              type="submit"
              disabled={isLoading || !email}
              className={styles.primaryButton}
            >
              {isLoading ? 'Sending...' : 'Send reset link'}
            </button>
            
            <Link to="/signin" className={styles.linkButton}>
              Remember your password? Sign in
            </Link>
          </form>
        </div>
      </Main>
    </Layout>
  );
}