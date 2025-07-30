import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-relay';
import Layout from '../layout/Layout';
import Main from '../layout/Main';
import Header from '../layout/Header';
import { useAuth } from '../../contexts/AuthContext';
import { UpdateProfileMutation, GenerateAvatarUploadUrlMutation } from '../../queries/auth';
import type { authUpdateProfileMutation } from '../../__generated__/authUpdateProfileMutation.graphql';
import type { authGenerateAvatarUploadUrlMutation } from '../../__generated__/authGenerateAvatarUploadUrlMutation.graphql';
import styles from './EditProfilePage.module.css';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [commitUpdate, isUpdateInFlight] = useMutation<authUpdateProfileMutation>(UpdateProfileMutation);
  const [commitAvatarUpload] = useMutation<authGenerateAvatarUploadUrlMutation>(GenerateAvatarUploadUrlMutation);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setAvatarFile(file);
    setAvatarRemoved(false); // Reset removed flag when selecting new image
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return null;

    setIsUploadingAvatar(true);
    try {
      // Get upload URL
      const uploadUrlResult = await new Promise<any>((resolve, reject) => {
        commitAvatarUpload({
          variables: {
            filename: avatarFile.name,
            contentType: avatarFile.type,
          },
          onCompleted: resolve,
          onError: reject,
        });
      });

      const { url, key } = uploadUrlResult.generateAvatarUploadUrl;

      // Upload to S3/Spaces
      const response = await fetch(url, {
        method: 'PUT',
        body: avatarFile,
        headers: {
          'Content-Type': avatarFile.type,
          'x-amz-acl': 'public-read',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      // Construct the public URL
      const spacesEndpoint = import.meta.env.VITE_SPACES_ENDPOINT || 'https://gild.sfo3.digitaloceanspaces.com';
      const publicUrl = `${spacesEndpoint}/${key}`;
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setError('Failed to upload avatar. Please try again.');
      return null;
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Handle avatar changes
    let finalAvatarUrl: string | null | undefined = undefined;
    
    if (avatarRemoved) {
      // User explicitly removed the avatar
      finalAvatarUrl = null;
    } else if (avatarFile) {
      // User selected a new avatar
      const uploadedUrl = await uploadAvatar();
      if (uploadedUrl) {
        finalAvatarUrl = uploadedUrl;
      } else {
        // Upload failed, error already set
        return;
      }
    }
    // If neither removed nor new file, don't update avatarUrl (keep undefined)

    commitUpdate({
      variables: {
        input: {
          name: name || undefined,
          phone: phone || undefined,
          avatarUrl: finalAvatarUrl,
        },
      },
      onCompleted: (response) => {
        // Update the user in auth context with the new data
        if (response.updateProfile) {
          updateUser(response.updateProfile);
        }
        navigate('/me');
      },
      onError: (error) => {
        setError(error.message);
      },
    });
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

              <div className={styles.avatarSection}>
                <label className={styles.avatarLabel}>Profile Picture</label>
                <div className={styles.avatarContainer}>
                  <div className={styles.avatarPreview}>
                    {avatarPreview || avatarUrl ? (
                      <img 
                        src={avatarPreview || avatarUrl} 
                        alt="Avatar preview" 
                        className={styles.avatarImage}
                      />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className={styles.avatarActions}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarSelect}
                      className={styles.fileInput}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={styles.uploadButton}
                      disabled={isUploadingAvatar}
                    >
                      {avatarFile ? 'Change Photo' : 'Upload Photo'}
                    </button>
                    {(avatarPreview || avatarUrl) && (
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarFile(null);
                          setAvatarPreview(null);
                          setAvatarUrl('');
                          setAvatarRemoved(true);
                        }}
                        className={styles.removeButton}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.buttonGroup}>
                <button
                  type="submit"
                  disabled={isUpdateInFlight || isUploadingAvatar}
                  className={styles.submitButton}
                >
                  {isUploadingAvatar ? 'Uploading...' : isUpdateInFlight ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Main>
    </Layout>
  );
}