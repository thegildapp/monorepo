import { Client } from '@opensearch-project/opensearch';

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

async function checkOpenSearch() {
  try {
    // Check if listings index exists
    const { body: indexExists } = await opensearchClient.indices.exists({
      index: 'listings'
    });
    console.log('Listings index exists:', indexExists);

    // Get index stats
    const { body: stats } = await opensearchClient.indices.stats({
      index: 'listings'
    });
    console.log('Index stats:', JSON.stringify(stats, null, 2));

    // Count documents
    const { body: count } = await opensearchClient.count({
      index: 'listings'
    });
    console.log('Document count:', count.count);

    // Search for all documents
    const { body: searchResult } = await opensearchClient.search({
      index: 'listings',
      body: {
        query: {
          match_all: {}
        }
      }
    });
    console.log('Total hits:', searchResult.hits.total.value);
    console.log('Documents:', searchResult.hits.hits.map((hit: any) => ({
      id: hit._id,
      title: hit._source.title
    })));

  } catch (error) {
    console.error('Error checking OpenSearch:', error);
  }
}

checkOpenSearch();