import { Client } from '@opensearch-project/opensearch';

// OpenSearch client configuration for managed database
const client = new Client({
  node: process.env.OPENSEARCH_CONNECTION_STRING || process.env.OPENSEARCH_URL || 'https://localhost:9200',
  // For managed OpenSearch, authentication is typically handled via the connection string
  // or AWS IAM roles, so we'll keep this flexible
  ...(process.env.OPENSEARCH_USERNAME && process.env.OPENSEARCH_PASSWORD ? {
    auth: {
      username: process.env.OPENSEARCH_USERNAME,
      password: process.env.OPENSEARCH_PASSWORD
    }
  } : {}),
  ssl: {
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  }
});

export default client;

// OpenSearch index name
export const LISTINGS_INDEX = 'listings';

// Helper function to check if OpenSearch is available
export async function isOpenSearchAvailable(): Promise<boolean> {
  try {
    await client.ping();
    return true;
  } catch (error) {
    console.warn('OpenSearch not available, falling back to database search:', error);
    return false;
  }
}

// Helper function to ensure index exists
export async function ensureListingsIndex(): Promise<void> {
  try {
    const { body: exists } = await client.indices.exists({
      index: LISTINGS_INDEX
    });

    if (!exists) {
      console.log('Creating listings index...');
      await client.indices.create({
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
              category: { type: 'keyword' },
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
              specifications: {
                type: 'object',
                properties: {
                  year: { type: 'integer' },
                  make: {
                    type: 'text',
                    analyzer: 'standard',
                    fields: {
                      keyword: { type: 'keyword' }
                    }
                  },
                  model: {
                    type: 'text',
                    analyzer: 'standard',
                    fields: {
                      keyword: { type: 'keyword' }
                    }
                  },
                  mileage: { type: 'integer' },
                  engineSize: { type: 'float' },
                  engineType: { type: 'keyword' },
                  transmission: { type: 'keyword' },
                  fuelType: { type: 'keyword' },
                  length: { type: 'float' },
                  hullMaterial: { type: 'keyword' },
                  horsepower: { type: 'integer' },
                  hours: { type: 'float' },
                  seats: { type: 'integer' }
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
          },
          settings: {
            analysis: {
              analyzer: {
                autocomplete: {
                  type: 'custom',
                  tokenizer: 'autocomplete',
                  filter: ['lowercase']
                },
                autocomplete_search: {
                  type: 'custom',
                  tokenizer: 'lowercase'
                }
              },
              tokenizer: {
                autocomplete: {
                  type: 'edge_ngram',
                  min_gram: 2,
                  max_gram: 10,
                  token_chars: ['letter', 'digit']
                }
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

// Helper function to index a listing
export async function indexListing(listing: any): Promise<void> {
  try {
    await client.index({
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

// Helper function to delete a listing from index
export async function deleteListing(id: string): Promise<void> {
  try {
    await client.delete({
      index: LISTINGS_INDEX,
      id
    });
  } catch (error) {
    console.error('Error deleting listing from index:', error);
    throw error;
  }
}