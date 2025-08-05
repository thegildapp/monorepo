import OpenAI from 'openai';
import { logger } from '../services/loggingService';

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'] || '',
});

export async function moderateContent(title: string, description: string): Promise<boolean> {
  if (!process.env['OPENAI_API_KEY']) {
    logger.warn('OpenAI API key not configured, skipping content moderation');
    return true; // Allow content if no API key
  }

  try {
    const content = `${title}\n\n${description}`;
    const response = await openai.moderations.create({
      input: content,
    });

    const result = response.results?.[0];
    
    if (!result) {
      logger.warn('No moderation result received, defaulting to approved');
      return true;
    }
    
    // Moderation result received

    return !result.flagged;
  } catch (error) {
    logger.error('Error during content moderation', error as Error);
    // In case of error, default to allowing content to avoid blocking legitimate users
    return true;
  }
}

export async function updateListingStatus(listingId: string, isApproved: boolean) {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  try {
    await prisma.listing.update({
      where: { id: listingId },
      data: { 
        status: isApproved ? 'APPROVED' : 'REJECTED' 
      },
    });
    
    // Listing status updated
  } catch (error) {
    logger.error('Error updating listing status', error as Error, { metadata: { listingId, isApproved } });
  } finally {
    await prisma.$disconnect();
  }
}