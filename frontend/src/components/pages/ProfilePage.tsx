import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-relay';
import Layout from '../layout/Layout';
import Main from '../layout/Main';
import Header from '../layout/Header';
import { useAuth } from '../../contexts/AuthContext';
import { UpdateProfileMutation } from '../../queries/auth';
import type { authUpdateProfileMutation } from '../../__generated__/authUpdateProfileMutation.graphql';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [commitUpdate, isUpdateInFlight] = useMutation<authUpdateProfileMutation>(UpdateProfileMutation);

  // Redirect if not logged in
  if (!user) {
    navigate('/signin');
    return null;
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    commitUpdate({
      variables: {
        input: {
          name: name || undefined,
          phone: phone || undefined,
          avatarUrl: avatarUrl || undefined,
        },
      },
      onCompleted: () => {
        setSuccess('Profile updated successfully');
        setIsEditing(false);
        // Update local user data would happen here in a real app
      },
      onError: (error) => {
        setError(error.message);
      },
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Layout>
      <Header logoText="Gild" showSearch={false} />
      <Main>
        <div className={styles.container}>
          <div className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <div className={styles.avatarSection}>
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className={styles.avatar} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <h2 className={styles.userName}>{user.name}</h2>
              <p className={styles.userEmail}>{user.email}</p>
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdate} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="avatarUrl">Avatar URL</label>
                  <input
                    id="avatarUrl"
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className={styles.input}
                  />
                </div>

                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}

                <div className={styles.buttonGroup}>
                  <button
                    type="submit"
                    disabled={isUpdateInFlight}
                    className={styles.saveButton}
                  >
                    {isUpdateInFlight ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.profileInfo}>
                <div className={styles.infoGroup}>
                  <span className={styles.label}>Email</span>
                  <span className={styles.value}>{user.email}</span>
                </div>
                {user.phone && (
                  <div className={styles.infoGroup}>
                    <span className={styles.label}>Phone</span>
                    <span className={styles.value}>{user.phone}</span>
                  </div>
                )}

                <div className={styles.actions}>
                  <button
                    onClick={() => setIsEditing(true)}
                    className={styles.editButton}
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className={styles.logoutButton}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Main>
    </Layout>
  );
}