import { graphql } from 'relay-runtime';

export const LoginMutation = graphql`
  mutation authLoginMutation($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        name
        avatarUrl
      }
    }
  }
`;

export const RegisterMutation = graphql`
  mutation authRegisterMutation($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        name
        avatarUrl
      }
    }
  }
`;

export const MeQuery = graphql`
  query authMeQuery {
    me {
      id
      email
      name
      avatarUrl
    }
  }
`;

export const UpdateProfileMutation = graphql`
  mutation authUpdateProfileMutation($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      email
      name
      phone
      avatarUrl
    }
  }
`;

export const GenerateAvatarUploadUrlMutation = graphql`
  mutation authGenerateAvatarUploadUrlMutation($filename: String!, $contentType: String!) {
    generateAvatarUploadUrl(filename: $filename, contentType: $contentType) {
      url
      key
    }
  }
`;