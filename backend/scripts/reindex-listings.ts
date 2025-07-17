import prisma from '../src/config/prisma';
import { indexListing, ensureListingsIndex } from '../src/config/opensearch';

async function reindexListings() {
  console.log('🔄 Starting reindex of approved listings...');
  
  try {
    // Ensure the index exists
    await ensureListingsIndex();
    
    // Get all approved listings
    const listings = await prisma.listing.findMany({
      where: { status: 'APPROVED' },
      include: { seller: true },
    });
    
    console.log(`Found ${listings.length} approved listings to index`);
    
    // Index each listing
    for (const listing of listings) {
      try {
        await indexListing(listing);
        console.log(`✅ Indexed listing: ${listing.id} - ${listing.title}`);
      } catch (error) {
        console.error(`❌ Failed to index listing ${listing.id}:`, error);
      }
    }
    
    console.log('🎉 Reindexing complete!');
  } catch (error) {
    console.error('Error during reindexing:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

reindexListings();