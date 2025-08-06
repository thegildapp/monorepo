import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useMutation, graphql } from 'react-relay';
import Layout from '../layout/Layout';
import Main from '../layout/Main';
import Header from '../layout/Header';
import styles from './AuthPage.module.css';
import PasskeyResetAccess from '../features/PasskeyResetAccess';
import type { ResetPasswordPageResetPasswordMutation } from '../../__generated__/ResetPasswordPageResetPasswordMutation.graphql';
import type { ResetPasswordPageValidateResetTokenMutation } from '../../__generated__/ResetPasswordPageValidateResetTokenMutation.graphql';
import { isPasskeySupported } from '../../utils/webauthn';

const RESET_PASSWORD_MUTATION = graphql`
  mutation ResetPasswordPageResetPasswordMutation($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword) {
      user {
        id
        email
        name
      }
      token
      errors {
        field
        message
        code
      }
    }
  }
`;

const VALIDATE_TOKEN_MUTATION = graphql`
  mutation ResetPasswordPageValidateResetTokenMutation($token: String!) {
    validatePasswordResetToken(token: $token) {
      valid
      user {
        id
        email
        name
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [mode, setMode] = useState<'passkey' | 'password'>('passkey');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [passkeySupported, setPasskeySupported] = useState(false);

  const [commit] = useMutation<ResetPasswordPageResetPasswordMutation>(RESET_PASSWORD_MUTATION);
  const [commitValidate] = useMutation<ResetPasswordPageValidateResetTokenMutation>(VALIDATE_TOKEN_MUTATION);

  useEffect(() => {
    if (!token) {
      navigate('/forgot-password');
      return;
    }

    // Check passkey support
    setPasskeySupported(isPasskeySupported());

    // Validate the token first
    setIsValidating(true);
    commitValidate({
      variables: { token },
      onCompleted: (response) => {
        setIsValidating(false);
        if (response.validatePasswordResetToken.valid && response.validatePasswordResetToken.user) {
          setUserEmail(response.validatePasswordResetToken.user.email);
          setUserName(response.validatePasswordResetToken.user.name);
          // If passkeys not supported, default to password mode
          if (!isPasskeySupported()) {
            setMode('password');
          }
        } else {
          const error = response.validatePasswordResetToken.errors?.[0];
          setErrors({ 
            general: error?.message || 'Invalid or expired reset link',
            token: error?.code || 'INVALID_TOKEN'
          });
        }
      },
      onError: () => {
        setIsValidating(false);
        setErrors({ general: 'Failed to validate reset link' });
      }
    });
  }, [token, navigate, commitValidate]);

  const handlePasswordReset = (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate passwords
    if (newPassword.length < 8) {
      setErrors({ newPassword: 'Password must be at least 8 characters long' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    if (!token) {
      return;
    }

    setIsLoading(true);

    commit({
      variables: {
        token,
        newPassword
      },
      onCompleted: (response) => {
        setIsLoading(false);
        if (response.resetPassword.user) {
          setShowSuccess(true);
        } else if (response.resetPassword.errors && response.resetPassword.errors.length > 0) {
          const errorMap: Record<string, string> = {};
          response.resetPassword.errors.forEach((error) => {
            if (error.field) {
              errorMap[error.field] = error.message;
            } else {
              errorMap.general = error.message;
            }
          });
          setErrors(errorMap);
        }
      },
      onError: (error) => {
        setIsLoading(false);
        console.error('Password reset failed:', error);
        setErrors({ general: 'An error occurred. Please try again.' });
      }
    });
  };

  const handlePasskeySuccess = (token: string) => {
    // Don't auto-sign in, just show success
    setShowSuccess(true);
  };

  if (isValidating) {
    return (
      <Layout>
        <Header logoText="Gild" showSearch={false} />
        <Main>
          <div className={styles.container}>
            <div className={styles.form}>
              <h1 className={styles.title}>Validating reset link...</h1>
            </div>
          </div>
        </Main>
      </Layout>
    );
  }

  if (errors.token) {
    return (
      <Layout>
        <Header logoText="Gild" showSearch={false} />
        <Main>
          <div className={styles.container}>
            <div className={styles.form}>
              <h1 className={styles.title}>Reset link expired</h1>
              <p className={styles.subtitle}>
                {errors.general || 'This reset link has expired or is invalid.'}
              </p>
              <Link to="/forgot-password" className={styles.primaryButton}>
                Request a new link
              </Link>
              <Link to="/signin" className={styles.linkButton}>
                Back to sign in
              </Link>
            </div>
          </div>
        </Main>
      </Layout>
    );
  }

  if (showSuccess) {
    return (
      <Layout>
        <Header logoText="Gild" showSearch={false} />
        <Main>
          <div className={styles.container}>
            <div className={styles.form}>
              <h1 className={styles.title}>{mode === 'passkey' ? 'Passkey added successfully!' : 'Password reset successful!'}</h1>
              <p className={styles.subtitle}>
                {mode === 'passkey' 
                  ? 'Your passkey has been added successfully. You can now sign in with your passkey.'
                  : 'Your password has been reset successfully. You can now sign in with your new password.'}
              </p>
              <Link to="/signin" className={styles.primaryButton}>
                Go to Sign In
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
          <div className={styles.form}>
            <h1 className={styles.title}>Restore account access</h1>
            <p className={styles.subtitle}>
              Hi {userName.split(' ')[0]}, let's get you back into your account.
            </p>

            {passkeySupported && (
              <div className={styles.tabContainer}>
                <button
                  type="button"
                  className={`${styles.tab} ${mode === 'passkey' ? styles.activeTab : ''}`}
                  onClick={() => setMode('passkey')}
                >
                  Add a passkey
                </button>
                <button
                  type="button"
                  className={`${styles.tab} ${mode === 'password' ? styles.activeTab : ''}`}
                  onClick={() => setMode('password')}
                >
                  Reset password
                </button>
              </div>
            )}

            {errors.general && (
              <div className={styles.error}>{errors.general}</div>
            )}

            {mode === 'passkey' && passkeySupported ? (
              <div className={styles.passkeySection}>
                <p className={styles.passkeyInfo}>
                  Passkeys let you sign in with just your fingerprint, face, or device PIN - no password needed.
                </p>
                <PasskeyResetAccess
                  resetToken={token!}
                  onSuccess={handlePasskeySuccess}
                  onError={(message) => setErrors({ general: message })}
                />
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} noValidate>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className={styles.input}
                    autoFocus
                    autoComplete="new-password"
                    disabled={isLoading}
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
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
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.newPassword && <div className={styles.error}>{errors.newPassword}</div>}

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className={styles.input}
                  autoComplete="new-password"
                  disabled={isLoading}
                  minLength={8}
                />
                {errors.confirmPassword && <div className={styles.error}>{errors.confirmPassword}</div>}

                <button 
                  type="submit" 
                  className={styles.primaryButton}
                  disabled={isLoading || !newPassword || !confirmPassword}
                >
                  {isLoading ? 'Resetting...' : 'Reset password'}
                </button>
              </form>
            )}

            <Link to="/signin" className={styles.linkButton} style={{ marginTop: '16px' }}>
              Back to sign in
            </Link>
          </div>
        </div>
      </Main>
    </Layout>
  );
}