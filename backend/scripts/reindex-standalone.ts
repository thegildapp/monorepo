import { PrismaClient } from '@prisma/client';
import { Client } from '@opensearch-project/opensearch';

const prisma = new PrismaClient();

// OpenSearch client configuration
const opensearchClient = new Client({
  node: process.env['OPENSEARCH_CONNECTION_STRING'] || process.env['OPENSEARCH_URL'] || 'https://localhost:9200',
  ...(process.env['OPENSEARCH_USERNAME'] && process.env['OPENSEARCH_PASSWORD'] ? {
    auth: {
      username: process.env['OPENSEARCH_USERNAME'],
      password: process.env['OPENSEARCH_PASSWORD']
    }
  } : {}),
  ssl: {
    rejectUnauthorized: process.env['NODE_ENV'] === 'production'
  }
});

const LISTINGS_INDEX = 'listings';

async function ensureListingsIndex() {
  try {
    const { body: exists } = await opensearchClient.indices.exists({
      index: LISTINGS_INDEX
    });

    if (!exists) {
      console.log('Creating listings index...');
      await opensearchClient.indices.create({
        index: LISTINGS_INDEX,
        body: {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              title: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              description: {
                type: 'text',
                analyzer: 'standard'
              },
              price: { type: 'integer' },
              images: { type: 'keyword', index: false },
              city: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              state: { type: 'keyword' },
              location: { type: 'geo_point' },
              seller: {
                properties: {
                  id: { type: 'keyword' },
                  name: {
                    type: 'text',
                    analyzer: 'standard'
                  },
                  phone: { type: 'keyword', index: false }
                }
              },
              createdAt: {
                type: 'date',
                format: 'strict_date_optional_time'
              },
              updatedAt: {
                type: 'date',
                format: 'strict_date_optional_time'
              }
            }
          }
        }
      });
      console.log('Listings index created successfully');
    }
  } catch (error) {
    console.error('Error creating listings index:', error);
    throw error;
  }
}

async function indexListing(listing: any): Promise<void> {
  try {
    await opensearchClient.index({
      index: LISTINGS_INDEX,
      id: listing.id,
      body: {
        ...listing,
        location: listing.latitude && listing.longitude 
          ? { lat: listing.latitude, lon: listing.longitude }
          : null
      }
    });
  } catch (error) {
    console.error('Error indexing listing:', error);
    throw error;
  }
}

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