import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type VerifiedRegistrationResponse,
  type VerifiedAuthenticationResponse,
} from '@simplewebauthn/server';
import type { AuthenticatorTransportFuture } from '@simplewebauthn/types';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/types';

// Configuration
const RP_NAME = 'Gild Marketplace';
const RP_ID = process.env['RP_ID'] || 'localhost';
const ORIGIN = process.env['FRONTEND_URL'] || 'http://localhost:5173';

// Store challenges temporarily (in production, use Redis or similar)
const challenges = new Map<string, string>();

export async function generateRegistrationOptionsForUser(userId: string, userEmail: string, userName: string) {
  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userID: Buffer.from(userId),
    userName: userEmail,
    userDisplayName: userName,
    attestationType: 'none',
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'preferred',
    },
    supportedAlgorithmIDs: [-7, -257], // ES256, RS256
  });

  // Store challenge for verification
  challenges.set(userId, options.challenge);

  // Clean up old challenges after 5 minutes
  setTimeout(() => challenges.delete(userId), 5 * 60 * 1000);

  return options;
}

export async function verifyRegistration(
  userId: string,
  response: RegistrationResponseJSON
): Promise<VerifiedRegistrationResponse> {
  const expectedChallenge = challenges.get(userId);
  
  if (!expectedChallenge) {
    throw new Error('No challenge found for user');
  }

  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
  });

  // Clean up used challenge
  challenges.delete(userId);

  return verification;
}

export async function generateAuthenticationOptionsForUser(
  userId: string,
  allowCredentials: Array<{ id: string; transports?: string[] }>
) {
  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    allowCredentials: allowCredentials.map(cred => ({
      id: cred.id,
      transports: cred.transports as AuthenticatorTransportFuture[] | undefined,
    })),
    userVerification: 'preferred',
  });

  // Store challenge for verification
  challenges.set(userId, options.challenge);

  // Clean up old challenges after 5 minutes
  setTimeout(() => challenges.delete(userId), 5 * 60 * 1000);

  return options;
}

export async function verifyAuthentication(
  userId: string,
  response: AuthenticationResponseJSON,
  credentialPublicKey: Buffer,
  counter: bigint
): Promise<VerifiedAuthenticationResponse> {
  const expectedChallenge = challenges.get(userId);
  
  if (!expectedChallenge) {
    throw new Error('No challenge found for user');
  }

  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
    requireUserVerification: false,
    credential: {
      id: response.id,
      publicKey: credentialPublicKey,
      counter: Number(counter),
    },
  });

  // Clean up used challenge
  challenges.delete(userId);

  return verification;
}

// Helper to convert base64url to Buffer
export function base64urlToBuffer(base64url: string): Buffer {
  return Buffer.from(base64url, 'base64url');
}

// Helper to convert Buffer to base64url
export function bufferToBase64url(buffer: Buffer): string {
  return buffer.toString('base64url');
}