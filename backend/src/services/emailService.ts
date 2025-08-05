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

export async function generateVerificationToken(): Promise<string> {
  return crypto.randomBytes(32).toString('hex');
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
  // First, get the pending user without a transaction
  const pendingUser = await prisma.pendingUser.findUnique({
    where: { token },
  });

  if (!pendingUser) {
    return null;
  }

  // Check if token has expired
  if (new Date() > pendingUser.expiresAt) {
    // Delete expired pending user
    try {
      await prisma.pendingUser.delete({
        where: { id: pendingUser.id },
      });
    } catch (error) {
      // Already deleted
    }
    return null;
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: pendingUser.email },
  });

  if (existingUser) {
    // User already created, just delete the pending user and return the existing user ID
    try {
      await prisma.pendingUser.delete({
        where: { id: pendingUser.id },
      });
    } catch (error) {
      // Pending user might already be deleted in another request
    }
    return existingUser.id;
  }

  // Try to create the user in a transaction
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create the actual user
      let userData: any = {
        email: pendingUser.email,
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

      const user = await tx.user.create({
        data: userData,
      });

      // Delete the pending user
      await tx.pendingUser.delete({
        where: { id: pendingUser.id },
      });

      return user.id;
    });

    return result;
  } catch (error: any) {
    // If user was created by another request (race condition)
    if (error.code === 'P2002') {
      const existingUser = await prisma.user.findUnique({
        where: { email: pendingUser.email },
      });
      if (existingUser) {
        // Clean up pending user
        try {
          await prisma.pendingUser.delete({
            where: { id: pendingUser.id },
          });
        } catch (deleteError) {
          // Ignore if already deleted
        }
        return existingUser.id;
      }
    }
    throw error;
  }
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