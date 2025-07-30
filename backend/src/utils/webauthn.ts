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
import { getValkeyClient } from './valkey';

// Configuration
const RP_NAME = 'Gild Marketplace';
const RP_ID = process.env['RP_ID'] || 'localhost';
const ORIGIN = process.env['FRONTEND_URL'] || 'http://localhost:5173';

// Challenge TTL in seconds (5 minutes)
const CHALLENGE_TTL = 5 * 60;

// Fallback to in-memory storage for development without Valkey
const inMemoryChallenges = new Map<string, string>();
let useInMemory = false;

// Helper functions for challenge storage
async function setChallenge(userId: string, challenge: string): Promise<void> {
  if (useInMemory) {
    inMemoryChallenges.set(userId, challenge);
    // Clean up after TTL
    setTimeout(() => inMemoryChallenges.delete(userId), CHALLENGE_TTL * 1000);
    return;
  }

  try {
    const valkey = getValkeyClient();
    const key = `passkey:challenge:${userId}`;
    await valkey.setex(key, CHALLENGE_TTL, challenge);
  } catch (error) {
    console.error('Failed to set challenge in Valkey, falling back to in-memory:', error);
    useInMemory = true;
    inMemoryChallenges.set(userId, challenge);
    setTimeout(() => inMemoryChallenges.delete(userId), CHALLENGE_TTL * 1000);
  }
}

async function getChallenge(userId: string): Promise<string | null> {
  if (useInMemory) {
    return inMemoryChallenges.get(userId) || null;
  }

  try {
    const valkey = getValkeyClient();
    const key = `passkey:challenge:${userId}`;
    return await valkey.get(key);
  } catch (error) {
    console.error('Failed to get challenge from Valkey, falling back to in-memory:', error);
    useInMemory = true;
    return inMemoryChallenges.get(userId) || null;
  }
}

async function deleteChallenge(userId: string): Promise<void> {
  if (useInMemory) {
    inMemoryChallenges.delete(userId);
    return;
  }

  try {
    const valkey = getValkeyClient();
    const key = `passkey:challenge:${userId}`;
    await valkey.del(key);
  } catch (error) {
    console.error('Failed to delete challenge from Valkey:', error);
    inMemoryChallenges.delete(userId);
  }
}

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
  await setChallenge(userId, options.challenge);

  return options;
}

export async function verifyRegistration(
  userId: string,
  response: RegistrationResponseJSON
): Promise<VerifiedRegistrationResponse> {
  const expectedChallenge = await getChallenge(userId);
  
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
  await deleteChallenge(userId);

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
  await setChallenge(userId, options.challenge);

  return options;
}

export async function verifyAuthentication(
  userId: string,
  response: AuthenticationResponseJSON,
  credentialPublicKey: Buffer,
  counter: bigint
): Promise<VerifiedAuthenticationResponse> {
  const expectedChallenge = await getChallenge(userId);
  
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
  await deleteChallenge(userId);

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