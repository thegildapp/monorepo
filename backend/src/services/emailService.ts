import sgMail from '@sendgrid/mail';
import crypto from 'crypto';
import prisma from '../config/prisma';
import { logger } from './loggingService';

// Initialize SendGrid
const sendgridApiKey = process.env['SENDGRID_API_KEY'];
if (sendgridApiKey) {
  sgMail.setApiKey(sendgridApiKey);
}

export interface EmailVerificationData {
  email: string;
  name: string;
  token: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function generateVerificationToken(): Promise<string> {
  return crypto.randomBytes(32).toString('hex');
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  if (!sendgridApiKey) {
    logger.warn('SendGrid API key not configured, skipping email send');
    return;
  }

  const msg = {
    to: options.to,
    from: {
      email: 'contact@thegild.app',
      name: 'Gild'
    },
    subject: options.subject,
    text: options.text || '',
    html: options.html || options.text || '',
    trackingSettings: {
      clickTracking: {
        enable: false
      },
      openTracking: {
        enable: false
      },
      subscriptionTracking: {
        enable: false
      }
    }
  };

  try {
    await sgMail.send(msg);
    logger.info('Email sent successfully', { metadata: { to: options.to, subject: options.subject } });
  } catch (error) {
    logger.error('Error sending email', error as Error, { metadata: { to: options.to, subject: options.subject } });
    throw error;
  }
}

export async function sendVerificationEmail(data: EmailVerificationData): Promise<void> {
  if (!sendgridApiKey) {
    logger.warn('SendGrid API key not configured, skipping email send');
    return;
  }

  const verificationUrl = `${process.env['FRONTEND_URL'] || 'https://thegild.app'}/verify-email?token=${data.token}`;
  
  const msg = {
    to: data.email,
    from: {
      email: 'contact@thegild.app',
      name: 'Gild'
    },
    subject: 'Verify your email address',
    trackingSettings: {
      clickTracking: {
        enable: false
      },
      openTracking: {
        enable: false
      },
      subscriptionTracking: {
        enable: false
      }
    },
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://fonts.googleapis.com/css2?family=Tinos:wght@400;700&display=swap" rel="stylesheet">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Tinos', Georgia, serif; line-height: 1.6; color: #111111; background-color: #FAF9F8;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FAF9F8;">
            <tr>
              <td align="center" style="padding: 48px 24px;">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px;">
                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding-bottom: 48px;">
                      <a href="https://thegild.app" style="font-family: 'Tinos', Georgia, serif; font-size: 30px; font-weight: 400; color: #111111; text-decoration: none; letter-spacing: -0.02em;">Gild</a>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 16px; padding: 48px;">
                      <h1 style="font-family: 'Tinos', Georgia, serif; font-size: 30px; font-weight: 400; margin: 0 0 24px 0; color: #111111; letter-spacing: -0.02em;">Verify your email address</h1>
                      <p style="font-family: 'Tinos', Georgia, serif; margin: 0 0 16px 0; color: #404040; font-size: 16px; line-height: 1.6;">Hi ${data.name.split(' ')[0]},</p>
                      <p style="font-family: 'Tinos', Georgia, serif; margin: 0 0 16px 0; color: #404040; font-size: 16px; line-height: 1.6;">Welcome to Gild. Please verify your email address to complete your registration and start browsing unique items from your community.</p>
                      
                      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 32px 0;">
                        <tr>
                          <td align="center">
                            <a href="${verificationUrl}" style="font-family: 'Tinos', Georgia, serif; display: inline-block; padding: 12px 32px; background-color: #111111; color: #ffffff; text-decoration: none; border-radius: 2px; font-size: 15px; font-weight: 400;">Verify Email</a>
                          </td>
                        </tr>
                      </table>
                      
                      <hr style="height: 1px; background-color: #e5e5e5; border: none; margin: 32px 0;">
                      
                      <p style="font-family: 'Tinos', Georgia, serif; font-size: 14px; color: #737373; margin-top: 32px; text-align: center;">
                        If you didn't create an account with Gild, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding-top: 48px;">
                      <p style="font-family: 'Tinos', Georgia, serif; margin: 8px 0; color: #737373; font-size: 14px;">© ${new Date().getFullYear()} Gild</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `Hi ${data.name.split(' ')[0]},\n\nWelcome to Gild. Please verify your email address by clicking the link below:\n\n${verificationUrl}\n\nIf you didn't create an account with Gild, you can safely ignore this email.\n\nGild`
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    logger.error('Error sending verification email', error as Error, { metadata: { email: data.email } });
    throw new Error('Failed to send verification email');
  }
}

export async function verifyEmailToken(token: string): Promise<string | null> {
  // First, get the pending user
  const pendingUser = await prisma.pendingUser.findUnique({
    where: { token },
  });

  if (!pendingUser) {
    return null;
  }

  // Check if token has expired
  if (new Date() > pendingUser.expiresAt) {
    // Delete expired pending user
    await prisma.pendingUser.deleteMany({
      where: { id: pendingUser.id },
    });
    return null;
  }

  const email = pendingUser.email.toLowerCase();

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    // User already exists, clean up pending user and return
    await prisma.pendingUser.deleteMany({
      where: { id: pendingUser.id },
    });
    return existingUser.id;
  }

  // Prepare user data
  let userData: any = {
    email,
    password: pendingUser.password, // Already hashed
    name: pendingUser.name,
    phone: pendingUser.phone,
  };

  // If there's passkey data, prepare it for creation
  if (pendingUser.passkeyData && typeof pendingUser.passkeyData === 'object') {
    const passkeyData = pendingUser.passkeyData as any;
    userData.passkeys = {
      create: {
        credentialId: passkeyData.credentialId,
        credentialPublicKey: Buffer.from(passkeyData.credentialPublicKey, 'base64'),
        counter: BigInt(passkeyData.counter),
        deviceType: passkeyData.deviceType,
        backedUp: passkeyData.backedUp,
        transports: passkeyData.transports || [],
        name: passkeyData.name,
      },
    };
  }

  // Use a transaction to handle the user creation atomically
  const result = await prisma.$transaction(async (tx) => {
    // Double-check if user exists within the transaction
    const existingUserInTx = await tx.user.findUnique({
      where: { email },
    });

    if (existingUserInTx) {
      // User already exists, return it
      return existingUserInTx;
    }

    // Create the new user
    const newUser = await tx.user.create({
      data: userData,
    });

    return newUser;
  }).catch(async (error: any) => {
    // If unique constraint error (user was created by another concurrent request)
    if (error.code === 'P2002' || error.message?.includes('Unique constraint failed')) {
      // Try to find the user that was created
      const createdUser = await prisma.user.findUnique({
        where: { email },
      });

      if (createdUser) {
        return createdUser;
      }
    }
    
    // Re-throw other errors
    throw error;
  });

  // Clean up pending user after successful user creation
  // Do this outside the transaction to avoid holding locks
  await prisma.pendingUser.deleteMany({
    where: { id: pendingUser.id },
  });

  return result.id;
}

export async function resendVerificationEmail(email: string): Promise<void> {
  const pendingUser = await prisma.pendingUser.findUnique({
    where: { email },
  });

  if (!pendingUser) {
    throw new Error('No pending verification found for this email');
  }

  // Check if token has expired
  if (new Date() > pendingUser.expiresAt) {
    throw new Error('Verification token has expired. Please sign up again.');
  }

  await sendVerificationEmail({
    email: pendingUser.email,
    name: pendingUser.name,
    token: pendingUser.token,
  });
}