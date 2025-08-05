import { useState } from 'react';
import { useMutation } from 'react-relay';
import { graphql } from 'react-relay';
import { registerPasskey } from '../../utils/webauthn';
import styles from './PasskeyAuth.module.css';

const CREATE_PASSKEY_WITH_RESET_TOKEN = graphql`
  mutation PasskeyResetAccessCreateMutation($resetToken: String!) {
    createPasskeyWithResetToken(resetToken: $resetToken) {
      publicKey
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

const VERIFY_PASSKEY_WITH_RESET_TOKEN = graphql`
  mutation PasskeyResetAccessVerifyMutation($resetToken: String!, $response: String!, $name: String) {
    verifyPasskeyWithResetToken(resetToken: $resetToken, response: $response, name: $name) {
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

interface PasskeyResetAccessProps {
  resetToken: string;
  onSuccess: (token: string) => void;
  onError: (message: string) => void;
}

export default function PasskeyResetAccess({ resetToken, onSuccess, onError }: PasskeyResetAccessProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const [commitCreate] = useMutation(CREATE_PASSKEY_WITH_RESET_TOKEN);
  const [commitVerify] = useMutation(VERIFY_PASSKEY_WITH_RESET_TOKEN);
  
  const handleAddPasskey = async () => {
    setIsLoading(true);
    
    commitCreate({
      variables: { resetToken },
      onCompleted: async (response) => {
        if (response.createPasskeyWithResetToken.errors?.length) {
          const error = response.createPasskeyWithResetToken.errors[0];
          onError(error.message);
          setIsLoading(false);
          return;
        }
        
        if (response.createPasskeyWithResetToken.publicKey) {
          try {
            const options = JSON.parse(response.createPasskeyWithResetToken.publicKey);
            const credential = await registerPasskey(options);
            
            commitVerify({
              variables: {
                resetToken,
                response: JSON.stringify(credential),
                name: `Passkey ${new Date().toLocaleDateString()}`
              },
              onCompleted: (verifyResponse) => {
                setIsLoading(false);
                if (verifyResponse.verifyPasskeyWithResetToken.errors?.length) {
                  const error = verifyResponse.verifyPasskeyWithResetToken.errors[0];
                  onError(error.message);
                } else if (verifyResponse.verifyPasskeyWithResetToken.token) {
                  onSuccess(verifyResponse.verifyPasskeyWithResetToken.token);
                }
              },
              onError: (error) => {
                setIsLoading(false);
                onError('Failed to verify passkey. Please try again.');
              }
            });
          } catch (error: any) {
            setIsLoading(false);
            if (error.name === 'NotAllowedError') {
              onError('Passkey creation was cancelled.');
            } else {
              onError('Failed to create passkey. Please try again.');
            }
          }
        }
      },
      onError: (error) => {
        setIsLoading(false);
        onError('Failed to start passkey creation. Please try again.');
      }
    });
  };
  
  return (
    <button
      onClick={handleAddPasskey}
      disabled={isLoading}
      className={styles.primaryButton}
    >
      {isLoading ? 'Setting up passkey...' : 'Add passkey to your account'}
    </button>
  );
}