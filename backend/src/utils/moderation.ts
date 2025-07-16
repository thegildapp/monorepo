import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'] || '',
});

export async function moderateContent(title: string, description: string): Promise<boolean> {
  if (!process.env['OPENAI_API_KEY']) {
    console.warn('OpenAI API key not configured, skipping content moderation');
    return true; // Allow content if no API key
  }

  try {
    const content = `${title}\n\n${description}`;
    const response = await openai.moderations.create({
      input: content,
    });

    const result = response.results?.[0];
    
    if (!result) {
      console.warn('No moderation result received, defaulting to approved');
      return true;
    }
    
    // Log the moderation result for debugging
    console.log('Content moderation result:', {
      flagged: result.flagged,
      categories: result.categories,
      title: title.substring(0, 50) + '...',
    });

    return !result.flagged;
  } catch (error) {
    console.error('Error during content moderation:', error);
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
    
    console.log(`Listing ${listingId} ${isApproved ? 'approved' : 'rejected'}`);
  } catch (error) {
    console.error('Error updating listing status:', error);
  } finally {
    await prisma.$disconnect();
  }
}