import prismaLogs from '../config/prismaLogs';

async function checkListingErrors() {
  try {
    // Query for recent errors related to listing creation
    const recentErrors = await prismaLogs.log.findMany({
      where: {
        AND: [
          {
            level: 'error'
          },
          {
            OR: [
              {
                message: {
                  contains: 'listing'
                }
              },
              {
                errorMessage: {
                  contains: 'listing'
                }
              },
              {
                path: {
                  contains: 'createListing'
                }
              }
            ]
          },
          {
            timestamp: {
              gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
            }
          }
        ]
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 10
    });

    console.log(`Found ${recentErrors.length} listing-related errors in the last hour:\n`);
    
    for (const error of recentErrors) {
      console.log('='.repeat(80));
      console.log(`Timestamp: ${error.timestamp}`);
      console.log(`Level: ${error.level}`);
      console.log(`Message: ${error.message}`);
      
      if (error.errorMessage) {
        console.log(`Error: ${error.errorMessage}`);
      }
      
      if (error.errorStack) {
        console.log(`Stack trace:\n${error.errorStack}`);
      }
      
      if (error.metadata) {
        console.log(`Metadata: ${JSON.stringify(error.metadata, null, 2)}`);
      }
      
      if (error.userId) {
        console.log(`User ID: ${error.userId}`);
      }
      
      if (error.path) {
        console.log(`Path: ${error.path}`);
      }
    }

    // Also check for payment-related errors
    console.log('\n' + '='.repeat(80));
    console.log('Checking for payment/Stripe errors...\n');
    
    const paymentErrors = await prismaLogs.log.findMany({
      where: {
        AND: [
          {
            level: 'error'
          },
          {
            OR: [
              {
                message: {
                  contains: 'payment',
                  mode: 'insensitive'
                }
              },
              {
                message: {
                  contains: 'stripe',
                  mode: 'insensitive'
                }
              },
              {
                errorMessage: {
                  contains: 'payment',
                  mode: 'insensitive'
                }
              },
              {
                errorMessage: {
                  contains: 'stripe',
                  mode: 'insensitive'
                }
              }
            ]
          },
          {
            timestamp: {
              gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
            }
          }
        ]
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 5
    });

    console.log(`Found ${paymentErrors.length} payment-related errors in the last hour:\n`);
    
    for (const error of paymentErrors) {
      console.log('='.repeat(80));
      console.log(`Timestamp: ${error.timestamp}`);
      console.log(`Message: ${error.message}`);
      
      if (error.errorMessage) {
        console.log(`Error: ${error.errorMessage}`);
      }
      
      if (error.metadata) {
        console.log(`Metadata: ${JSON.stringify(error.metadata, null, 2)}`);
      }
    }

  } catch (error) {
    console.error('Failed to query logs:', error);
  } finally {
    await prismaLogs.$disconnect();
  }
}

// Run the script
checkListingErrors();