import { 
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable
} from '@simplewebauthn/browser';
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/types';

export { browserSupportsWebAuthn, platformAuthenticatorIsAvailable };

export async function registerPasskey(options: PublicKeyCredentialCreationOptionsJSON): Promise<RegistrationResponseJSON> {
  try {
    const response = await startRegistration(options);
    return response;
  } catch (error) {
    console.error('Passkey registration error:', error);
    throw error;
  }
}

export async function authenticateWithPasskey(options: PublicKeyCredentialRequestOptionsJSON): Promise<AuthenticationResponseJSON> {
  try {
    const response = await startAuthentication(options);
    return response;
  } catch (error) {
    console.error('Passkey authentication error:', error);
    throw error;
  }
}

export function isPasskeySupported(): boolean {
  return browserSupportsWebAuthn();
}

export async function isPasskeyAvailable(): Promise<boolean> {
  if (!browserSupportsWebAuthn()) {
    return false;
  }
  
  try {
    return await platformAuthenticatorIsAvailable();
  } catch {
    return false;
  }
}