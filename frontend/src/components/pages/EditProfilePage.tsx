import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-relay';
import Layout from '../layout/Layout';
import Main from '../layout/Main';
import Header from '../layout/Header';
import CreateListingModal from '../features/CreateListingModal';
import { useAuth } from '../../contexts/AuthContext';
import { UpdateProfileMutation, GenerateAvatarUploadUrlMutation } from '../../queries/auth';
import type { authUpdateProfileMutation } from '../../__generated__/authUpdateProfileMutation.graphql';
import type { authGenerateAvatarUploadUrlMutation } from '../../__generated__/authGenerateAvatarUploadUrlMutation.graphql';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import styles from './EditProfilePage.module.css';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Format phone number for display
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else if (phoneNumber.length <= 10) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
    } else {
      // Handle international format with country code
      return `+${phoneNumber.slice(0, phoneNumber.length - 10)} (${phoneNumber.slice(-10, -7)}) ${phoneNumber.slice(-7, -4)}-${phoneNumber.slice(-4)}`;
    }
  };

  // Handle phone input change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Allow only digits, spaces, parentheses, hyphens, and plus sign
    const cleaned = input.replace(/[^\d\s()\-+]/g, '');
    
    // If user is deleting, allow the raw input
    if (input.length < phone.length) {
      setPhone(cleaned);
      return;
    }
    
    // Get just the digits for formatting
    const digits = cleaned.replace(/\D/g, '');
    
    // Limit to reasonable phone number length (15 digits max for international)
    if (digits.length <= 15) {
      setPhone(formatPhoneNumber(digits));
    }
  };

  // Validate phone number
  const validatePhone = (phoneNumber: string): boolean => {
    const digits = phoneNumber.replace(/\D/g, '');
    // Valid if empty (optional field) or 10+ digits (US and international)
    return digits.length === 0 || digits.length >= 10;
  };

  const [commitUpdate, isUpdateInFlight] = useMutation<authUpdateProfileMutation>(UpdateProfileMutation);
  const [commitAvatarUpload] = useMutation<authGenerateAvatarUploadUrlMutation>(GenerateAvatarUploadUrlMutation);

  // Redirect if not logged in (but only after loading)
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/signin');
    }
  }, [isLoading, user, navigate]);

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone ? formatPhoneNumber(user.phone) : '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  if (isLoading || !user) {
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

      // Construct the CDN URL for better performance
      const cdnEndpoint = import.meta.env.VITE_CDN_ENDPOINT || 'https://gild.sfo3.cdn.digitaloceanspaces.com';
      const publicUrl = `${cdnEndpoint}/${key}`;
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setError('Failed to upload avatar. Please try again.');
      return null;
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setError('');

    // Validate phone number
    if (!validatePhone(phone)) {
      setError('Please enter a valid phone number (at least 10 digits)');
      return;
    }

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

    // Clean phone number to store only digits
    const cleanedPhone = phone ? phone.replace(/\D/g, '') : undefined;

    commitUpdate({
      variables: {
        input: {
          name: name || undefined,
          phone: cleanedPhone,
          avatarUrl: finalAvatarUrl,
        },
      },
      onCompleted: (response) => {
        // Update the user in auth context with the new data
        if (response.updateProfile) {
          updateUser(response.updateProfile);
        }
        setIsEditing(false);
        setAvatarFile(null);
        setAvatarPreview(null);
      },
      onError: (error) => {
        setError(error.message);
      },
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setName(user?.name || '');
    // Format the phone number when loading from user data
    setPhone(user?.phone ? formatPhoneNumber(user.phone) : '');
    setAvatarUrl(user?.avatarUrl || '');
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarRemoved(false);
    setError('');
  };

  const handleCreateClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateSuccess = () => {
    // Modal will close itself and the page will update if needed
  };


  return (
    <Layout>
      <Header logoText="Gild" showSearch={false} onListClick={handleCreateClick} />
      <Main>
        <div className={styles.container}>
          <div className={styles.content}>
            {/* Profile Header with Avatar and Name */}
            <div className={styles.profileHeader}>
              <div className={styles.avatarWrapper}>
                {avatarPreview || avatarUrl ? (
                  <img 
                    src={avatarPreview || avatarUrl} 
                    alt="Profile" 
                    className={styles.avatarImage}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                {isEditing && (
                  <div 
                    className={styles.avatarOverlay}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarSelect}
                      className={styles.fileInput}
                    />
                    <div className={styles.changeAvatarIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              
              <div className={styles.profileInfo}>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className={styles.nameInput}
                    autoFocus
                  />
                ) : (
                  <h1 className={styles.profileName}>
                    {user?.name || 'Unnamed User'}
                  </h1>
                )}
                <p className={styles.profileEmail}>{user?.email}</p>
              </div>

              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="secondary"
                  size="small"
                >
                  Edit Profile
                </Button>
              ) : (
                <div className={styles.headerActions}>
                  {(avatarPreview || avatarUrl) && (
                    <Button
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarPreview(null);
                        setAvatarUrl('');
                        setAvatarRemoved(true);
                      }}
                      variant="secondary"
                      size="small"
                    >
                      Remove Photo
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className={styles.divider} />

            {/* Contact Information */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Contact Information</h2>
              <div className={styles.infoGrid}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Phone</span>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="(555) 555-5555"
                      className={styles.infoInput}
                    />
                  ) : (
                    <span className={styles.infoValue}>
                      {phone || <span className={styles.placeholder}>Not set</span>}
                    </span>
                  )}
                </div>
              </div>
            </div>


            {error && (
              <>
                <div className={styles.divider} />
                <div className={styles.section}>
                  <div className={styles.errorMessage}>{error}</div>
                </div>
              </>
            )}

            {isEditing && (
              <>
                <div className={styles.divider} />
                <div className={styles.section}>
                  <div className={styles.actionButtons}>
                    <Button
                      onClick={handleCancel}
                      variant="secondary"
                      fullWidth
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      variant="primary"
                      fullWidth
                      disabled={isUpdateInFlight || isUploadingAvatar}
                    >
                      {isUploadingAvatar ? 'Uploading...' : isUpdateInFlight ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Main>
      
      <CreateListingModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        onSuccess={handleCreateSuccess}
      />
    </Layout>
  );
}