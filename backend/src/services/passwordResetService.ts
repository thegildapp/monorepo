import prisma from '../config/prisma';
import { sendEmail } from './emailService';
import { logger } from './loggingService';
import { checkRateLimit, RATE_LIMITS } from './rateLimitService';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { addHours } from 'date-fns';

const RESET_TOKEN_EXPIRY_HOURS = 1;
const FRONTEND_URL = process.env['FRONTEND_URL'] || 'http://localhost:5173';

export async function requestPasswordReset(email: string, ipAddress?: string) {
  try {
    // Rate limit by email
    const emailRateLimit = await checkRateLimit(email.toLowerCase(), RATE_LIMITS.PASSWORD_RESET);
    if (!emailRateLimit.allowed) {
      const hours = Math.ceil((emailRateLimit.retryAfter || 0) / 3600);
      const timeMessage = hours > 1 ? `${hours} hours` : '1 hour';
      return {
        success: false,
        message: `You've reached the maximum number of password reset requests. Please try again in ${timeMessage}.`,
        errors: [{
          field: 'email',
          message: `Too many password reset attempts. Please try again in ${timeMessage}.`,
          code: 'RATE_LIMIT_EXCEEDED'
        }]
      };
    }

    // Rate limit by IP address if provided
    if (ipAddress && ipAddress !== 'unknown') {
      const ipRateLimit = await checkRateLimit(ipAddress, RATE_LIMITS.PASSWORD_RESET_IP);
      if (!ipRateLimit.allowed) {
        const hours = Math.ceil((ipRateLimit.retryAfter || 0) / 3600);
        const timeMessage = hours > 1 ? `${hours} hours` : '1 hour';
        return {
          success: false,
          message: `Too many password reset requests from your location. Please try again in ${timeMessage}.`,
          errors: [{
            field: 'email',
            message: `Too many requests from your location. Please try again in ${timeMessage}.`,
            code: 'RATE_LIMIT_EXCEEDED'
          }]
        };
      }
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      // Don't reveal if user exists or not
      logger.info('Password reset requested for non-existent email', { metadata: { email } });
      return {
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.',
        errors: []
      };
    }

    // Delete any existing unused reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        usedAt: null
      }
    });

    // Generate secure token
    const token = randomBytes(32).toString('hex');
    const expiresAt = addHours(new Date(), RESET_TOKEN_EXPIRY_HOURS);

    // Create reset token
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt
      }
    });

    // Send reset email
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
    
    try {
      await sendEmail({
        to: user.email,
        subject: 'Reset Your Password - Gild',
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <link href="https://fonts.googleapis.com/css2?family=Tinos:wght@400;700&display=swap" rel="stylesheet">
        </head>
        <body style="margin: 0; padding: 0;">
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
                      <h1 style="font-family: 'Tinos', Georgia, serif; font-size: 30px; font-weight: 400; margin: 0 0 24px 0; color: #111111; letter-spacing: -0.02em;">Reset your password</h1>
                      <p style="font-family: 'Tinos', Georgia, serif; margin: 0 0 16px 0; color: #404040; font-size: 16px; line-height: 1.6;">Hi ${user.name.split(' ')[0]},</p>
                      <p style="font-family: 'Tinos', Georgia, serif; margin: 0 0 16px 0; color: #404040; font-size: 16px; line-height: 1.6;">We received a request to reset your password. Click the button below to create a new password.</p>
                      
                      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 32px 0;">
                        <tr>
                          <td align="center">
                            <a href="${resetUrl}" style="font-family: 'Tinos', Georgia, serif; display: inline-block; padding: 12px 32px; background-color: #111111; color: #ffffff; text-decoration: none; border-radius: 2px; font-size: 15px; font-weight: 400;">Reset Password</a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="font-family: 'Tinos', Georgia, serif; font-size: 14px; color: #737373; margin: 24px 0 16px 0;">
                        This link will expire in ${RESET_TOKEN_EXPIRY_HOURS} hour${RESET_TOKEN_EXPIRY_HOURS > 1 ? 's' : ''}.
                      </p>
                      
                      <hr style="height: 1px; background-color: #e5e5e5; border: none; margin: 32px 0;">
                      
                      <p style="font-family: 'Tinos', Georgia, serif; font-size: 14px; color: #737373; margin-top: 32px; text-align: center;">
                        If you didn't request a password reset, you can safely ignore this email.
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
        text: `Hi ${user.name.split(' ')[0]},\n\nWe received a request to reset your password. Click the link below to create a new password:\n\n${resetUrl}\n\nThis link will expire in ${RESET_TOKEN_EXPIRY_HOURS} hour${RESET_TOKEN_EXPIRY_HOURS > 1 ? 's' : ''}.\n\nIf you didn't request a password reset, you can safely ignore this email.\n\nGild`
      });

      logger.info('Password reset email sent', { metadata: { userId: user.id } });
    } catch (emailError) {
      logger.error('Failed to send password reset email', emailError as Error, { 
        metadata: { 
          userId: user.id 
        } 
      });
      
      // Clean up the token if email fails
      await prisma.passwordResetToken.delete({
        where: { token }
      });

      return {
        success: false,
        message: 'Failed to send reset email. Please try again later.',
        errors: [{
          field: 'email',
          message: 'Failed to send reset email',
          code: 'EMAIL_FAILED'
        }]
      };
    }

    return {
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.',
      errors: []
    };
  } catch (error) {
    logger.error('Password reset request failed', error as Error, { 
      metadata: { 
        email 
      } 
    });
    
    return {
      success: false,
      message: 'An error occurred. Please try again later.',
      errors: [{
        field: 'general',
        message: 'An error occurred',
        code: 'UNKNOWN_ERROR'
      }]
    };
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    // Validate password strength
    if (newPassword.length < 8) {
      return {
        user: null,
        token: null,
        errors: [{
          field: 'newPassword',
          message: 'Password must be at least 8 characters long',
          code: 'WEAK_PASSWORD'
        }]
      };
    }

    // Find valid token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetToken) {
      return {
        user: null,
        token: null,
        errors: [{
          field: 'token',
          message: 'Invalid or expired reset link',
          code: 'INVALID_TOKEN'
        }]
      };
    }

    // Check if token is expired
    if (new Date() > resetToken.expiresAt) {
      return {
        user: null,
        token: null,
        errors: [{
          field: 'token',
          message: 'This reset link has expired',
          code: 'EXPIRED_TOKEN'
        }]
      };
    }

    // Check if token was already used
    if (resetToken.usedAt) {
      return {
        user: null,
        token: null,
        errors: [{
          field: 'token',
          message: 'This reset link has already been used',
          code: 'USED_TOKEN'
        }]
      };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and mark token as used in a transaction
    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword }
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() }
      })
    ]);

    logger.info('Password reset successful', { metadata: { userId: updatedUser.id } });

    // Send confirmation email
    try {
      await sendEmail({
        to: updatedUser.email,
        subject: 'Your Password Has Been Reset - Gild',
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Successful</title>
          <link href="https://fonts.googleapis.com/css2?family=Tinos:wght@400;700&display=swap" rel="stylesheet">
        </head>
        <body style="margin: 0; padding: 0;">
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
                      <h1 style="font-family: 'Tinos', Georgia, serif; font-size: 30px; font-weight: 400; margin: 0 0 24px 0; color: #111111; letter-spacing: -0.02em;">Password reset successful</h1>
                      <p style="font-family: 'Tinos', Georgia, serif; margin: 0 0 16px 0; color: #404040; font-size: 16px; line-height: 1.6;">Hi ${updatedUser.name.split(' ')[0]},</p>
                      <p style="font-family: 'Tinos', Georgia, serif; margin: 0 0 16px 0; color: #404040; font-size: 16px; line-height: 1.6;">Your password has been successfully reset. You can now sign in with your new password.</p>
                      
                      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 32px 0;">
                        <tr>
                          <td align="center">
                            <a href="${FRONTEND_URL}/signin" style="font-family: 'Tinos', Georgia, serif; display: inline-block; padding: 12px 32px; background-color: #111111; color: #ffffff; text-decoration: none; border-radius: 2px; font-size: 15px; font-weight: 400;">Sign In</a>
                          </td>
                        </tr>
                      </table>
                      
                      <hr style="height: 1px; background-color: #e5e5e5; border: none; margin: 32px 0;">
                      
                      <p style="font-family: 'Tinos', Georgia, serif; font-size: 14px; color: #737373; margin-top: 32px; text-align: center;">
                        If you didn't make this change, please contact us immediately.
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
        text: `Hi ${updatedUser.name.split(' ')[0]},\n\nYour password has been successfully reset. You can now sign in with your new password.\n\nSign in at: ${FRONTEND_URL}/signin\n\nIf you didn't make this change, please contact us immediately.\n\nGild`
      });
    } catch (emailError) {
      // Log but don't fail the password reset
      logger.error('Failed to send password reset confirmation email', emailError as Error, { 
        metadata: { 
          userId: updatedUser.id 
        } 
      });
    }

    return {
      user: updatedUser,
      token: null,
      errors: []
    };
  } catch (error) {
    logger.error('Password reset failed', error as Error, { 
      metadata: { 
        token 
      } 
    });
    
    return {
      user: null,
      token: null,
      errors: [{
        field: 'general',
        message: 'An error occurred. Please try again.',
        code: 'UNKNOWN_ERROR'
      }]
    };
  }
}

export async function validatePasswordResetToken(token: string) {
  try {
    // Find the reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetToken) {
      return {
        valid: false,
        user: null,
        errors: [{
          field: 'token',
          message: 'Invalid reset link',
          code: 'INVALID_TOKEN'
        }]
      };
    }

    // Check if token is expired
    if (new Date() > resetToken.expiresAt) {
      return {
        valid: false,
        user: null,
        errors: [{
          field: 'token',
          message: 'This reset link has expired',
          code: 'EXPIRED_TOKEN'
        }]
      };
    }

    // Check if token was already used
    if (resetToken.usedAt) {
      return {
        valid: false,
        user: null,
        errors: [{
          field: 'token',
          message: 'This reset link has already been used',
          code: 'USED_TOKEN'
        }]
      };
    }

    // Token is valid
    return {
      valid: true,
      user: resetToken.user,
      errors: []
    };
  } catch (error) {
    logger.error('Token validation failed', error as Error, { 
      metadata: { token } 
    });
    
    return {
      valid: false,
      user: null,
      errors: [{
        field: 'general',
        message: 'An error occurred validating the reset link',
        code: 'UNKNOWN_ERROR'
      }]
    };
  }
}

// Clean up expired tokens (can be run as a cron job)
export async function cleanupExpiredTokens() {
  try {
    const result = await prisma.passwordResetToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { usedAt: { not: null } }
        ]
      }
    });

    logger.info('Cleaned up expired password reset tokens', { 
      metadata: { count: result.count } 
    });
  } catch (error) {
    logger.error('Failed to clean up expired tokens', error as Error);
  }
}