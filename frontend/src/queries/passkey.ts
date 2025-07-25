import { graphql } from 'react-relay';

export const CREATE_PASSKEY_REGISTRATION_OPTIONS = graphql`
  mutation passkeyCreateRegistrationOptionsMutation {
    createPasskeyRegistrationOptions {
      publicKey
    }
  }
`;

export const VERIFY_PASSKEY_REGISTRATION = graphql`
  mutation passkeyVerifyRegistrationMutation($input: VerifyPasskeyRegistrationInput!) {
    verifyPasskeyRegistration(input: $input) {
      id
      name
      createdAt
      lastUsedAt
    }
  }
`;

export const CREATE_PASSKEY_AUTHENTICATION_OPTIONS = graphql`
  mutation passkeyCreateAuthenticationOptionsMutation($email: String!) {
    createPasskeyAuthenticationOptions(email: $email) {
      publicKey
    }
  }
`;

export const VERIFY_PASSKEY_AUTHENTICATION = graphql`
  mutation passkeyVerifyAuthenticationMutation($input: VerifyPasskeyAuthenticationInput!) {
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

export const DELETE_PASSKEY = graphql`
  mutation passkeyDeleteMutation($id: ID!) {
    deletePasskey(id: $id)
  }
`;