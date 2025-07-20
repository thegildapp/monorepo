import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-relay';
import Layout from '../layout/Layout';
import Main from '../layout/Main';
import Header from '../layout/Header';
import { useAuth } from '../../contexts/AuthContext';
import { UpdateProfileMutation } from '../../queries/auth';
import type { authUpdateProfileMutation } from '../../__generated__/authUpdateProfileMutation.graphql';
import styles from './EditProfilePage.module.css';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [error, setError] = useState('');

  const [commitUpdate, isUpdateInFlight] = useMutation<authUpdateProfileMutation>(UpdateProfileMutation);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    commitUpdate({
      variables: {
        input: {
          name: name || undefined,
          phone: phone || undefined,
          avatarUrl: avatarUrl || undefined,
        },
      },
      onCompleted: () => {
        navigate('/me');
      },
      onError: (error) => {
        setError(error.message);
      },
    });
  };

  const handleCancel = () => {
    navigate('/me');
  };

  return (
    <Layout>
      <Header logoText="Gild" showSearch={false} />
      <Main>
        <div className={styles.container}>
          <div className={styles.content}>
            <h1 className={styles.title}>Edit Profile</h1>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className={styles.input}
                autoFocus
              />

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone"
                className={styles.input}
              />

              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="Avatar URL"
                className={styles.input}
              />

              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.buttonGroup}>
                <button
                  type="submit"
                  disabled={isUpdateInFlight}
                  className={styles.submitButton}
                >
                  {isUpdateInFlight ? '...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </Main>
    </Layout>
  );
}