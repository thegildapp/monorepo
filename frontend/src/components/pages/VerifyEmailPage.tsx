import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { graphql, useMutation } from 'react-relay';
import Layout from '../layout/Layout';
import Main from '../layout/Main';
import Header from '../layout/Header';
import { useAuth } from '../../contexts/AuthContext';
import styles from './VerifyEmailPage.module.css';

const VERIFY_EMAIL_MUTATION = graphql`
  mutation VerifyEmailPageMutation($token: String!) {
    verifyEmail(token: $token) {
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

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState('');
  
  const [commit] = useMutation(VERIFY_EMAIL_MUTATION);
  
  const token = searchParams.get('token');
  
  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('No verification token provided');
      return;
    }
    
    // Verify the email
    commit({
      variables: { token },
      onCompleted: (response) => {
        if (response.verifyEmail) {
          setStatus('success');
          // Store the auth but don't redirect - let user click sign in
          login(response.verifyEmail.token, response.verifyEmail.user);
        }
      },
      onError: (error) => {
        setStatus('error');
        if (error.message.includes('Invalid or expired')) {
          setError('This verification link has expired or is invalid.');
        } else {
          setError('Something went wrong. Please try again.');
        }
      },
    });
  }, [token, commit, login]);
  
  return (
    <Layout>
      <Header logoText="Gild" showSearch={false} />
      <Main>
        <div className={styles.container}>
          <div className={styles.content}>
            {status === 'verifying' && (
              <>
                <h1 className={styles.title}>Verifying your email...</h1>
                <p className={styles.message}>Please wait while we verify your email address.</p>
              </>
            )}
            
            {status === 'success' && (
              <>
                <h1 className={styles.title}>Account Created!</h1>
                <p className={styles.message}>Your email has been verified successfully.</p>
                <Link to="/me" className={styles.button}>
                  Sign in to your account
                </Link>
                <p className={styles.closeMessage}>You can close this tab</p>
              </>
            )}
            
            {status === 'error' && (
              <>
                <h1 className={styles.title}>Verification Failed</h1>
                <p className={styles.message}>{error}</p>
                <Link to="/signin" className={styles.button}>
                  Back to sign in
                </Link>
                <p className={styles.closeMessage}>You can close this tab</p>
              </>
            )}
          </div>
        </div>
      </Main>
    </Layout>
  );
}