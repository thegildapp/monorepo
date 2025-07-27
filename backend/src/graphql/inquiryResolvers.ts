import { InquiryStatus } from '@prisma/client';
import { YogaInitialContext } from 'graphql-yoga';
import type { PrismaClient } from '@prisma/client';

interface Context {
  userId: string | undefined;
  prisma: PrismaClient;
}

type GraphQLContext = YogaInitialContext & Context;

// Safe user select to exclude password, email, and phone
const safeUserSelect = {
  id: true,
  name: true,
  avatarUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const inquiryResolvers = {
  Query: {
    inquiry: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const inquiry = await context.prisma.inquiry.findUnique({
        where: { id },
        include: {
          buyer: {
            select: safeUserSelect
          },
          seller: {
            select: safeUserSelect
          },
          listing: {
            include: { 
              seller: {
                select: safeUserSelect
              }
            }
          }
        }
      });

      if (!inquiry) {
        return null;
      }

      // Only buyer or seller can view the inquiry
      if (inquiry.buyerId !== context.userId && inquiry.sellerId !== context.userId) {
        throw new Error('Not authorized');
      }

      return inquiry;
    },

    myInquiries: async (
      _: any, 
      { type, status, limit = 20, offset = 0 }: {
        type: 'SENT' | 'RECEIVED';
        status?: InquiryStatus;
        limit?: number;
        offset?: number;
      },
      context: GraphQLContext
    ) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const whereClause: any = type === 'SENT' 
        ? { buyerId: context.userId }
        : { sellerId: context.userId };

      if (status) {
        whereClause.status = status;
      }

      const [inquiries, totalCount] = await Promise.all([
        context.prisma.inquiry.findMany({
          where: whereClause,
          include: {
            buyer: {
              select: safeUserSelect
            },
            seller: {
              select: safeUserSelect
            },
            listing: {
              include: { 
                seller: {
                  select: safeUserSelect
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset
        }),
        context.prisma.inquiry.count({ where: whereClause })
      ]);

      return {
        inquiries,
        totalCount,
        hasMore: offset + inquiries.length < totalCount
      };
    },

    myInquiryStats: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const [totalReceived, pendingCount, acceptedCount, rejectedCount] = await Promise.all([
        context.prisma.inquiry.count({
          where: { sellerId: context.userId }
        }),
        context.prisma.inquiry.count({
          where: { sellerId: context.userId, status: 'PENDING' }
        }),
        context.prisma.inquiry.count({
          where: { sellerId: context.userId, status: 'ACCEPTED' }
        }),
        context.prisma.inquiry.count({
          where: { sellerId: context.userId, status: 'REJECTED' }
        })
      ]);

      return {
        totalReceived,
        pendingCount,
        acceptedCount,
        rejectedCount
      };
    }
  },

  Mutation: {
    requestContact: async (
      _: any,
      { listingId }: { listingId: string },
      context: GraphQLContext
    ) => {
      if (!context.userId) {
        return {
          inquiry: null,
          errors: [{ field: null, message: 'Not authenticated' }]
        };
      }

      try {
        // Get the listing
        const listing = await context.prisma.listing.findUnique({
          where: { id: listingId },
          include: { 
            seller: {
              select: safeUserSelect
            }
          }
        });

        if (!listing) {
          return {
            inquiry: null,
            errors: [{ field: 'listingId', message: 'Listing not found' }]
          };
        }

        // Can't inquire about own listing
        if (listing.sellerId === context.userId) {
          return {
            inquiry: null,
            errors: [{ field: null, message: 'Cannot inquire about your own listing' }]
          };
        }

        // Check if already inquired
        const existingInquiry = await context.prisma.inquiry.findUnique({
          where: {
            buyerId_listingId: {
              buyerId: context.userId,
              listingId
            }
          }
        });

        if (existingInquiry) {
          return {
            inquiry: null,
            errors: [{ field: null, message: 'You have already sent an inquiry for this listing' }]
          };
        }

        // Create the inquiry
        const inquiry = await context.prisma.inquiry.create({
          data: {
            buyerId: context.userId,
            sellerId: listing.sellerId,
            listingId,
            status: 'PENDING'
          },
          include: {
            buyer: {
              select: safeUserSelect
            },
            seller: {
              select: safeUserSelect
            },
            listing: {
              include: { 
                seller: {
                  select: safeUserSelect
                }
              }
            }
          }
        });

        return {
          inquiry,
          errors: []
        };
      } catch (error) {
        console.error('Error creating inquiry:', error);
        return {
          inquiry: null,
          errors: [{ field: null, message: 'Failed to create inquiry' }]
        };
      }
    },

    acceptContactRequest: async (
      _: any,
      { inquiryId, shareEmail, sharePhone }: {
        inquiryId: string;
        shareEmail: boolean;
        sharePhone: boolean;
      },
      context: GraphQLContext
    ) => {
      if (!context.userId) {
        return {
          inquiry: null,
          errors: [{ field: null, message: 'Not authenticated' }]
        };
      }

      try {
        // Get the inquiry
        const inquiry = await context.prisma.inquiry.findUnique({
          where: { id: inquiryId },
          include: {
            buyer: {
              select: safeUserSelect
            },
            seller: {
              select: safeUserSelect
            },
            listing: {
              include: { 
                seller: {
                  select: safeUserSelect
                }
              }
            }
          }
        });

        if (!inquiry) {
          return {
            inquiry: null,
            errors: [{ field: 'inquiryId', message: 'Inquiry not found' }]
          };
        }

        // Only seller can accept
        if (inquiry.sellerId !== context.userId) {
          return {
            inquiry: null,
            errors: [{ field: null, message: 'Not authorized' }]
          };
        }

        // Only pending inquiries can be accepted
        if (inquiry.status !== 'PENDING') {
          return {
            inquiry: null,
            errors: [{ field: null, message: 'Inquiry has already been responded to' }]
          };
        }

        // Must share at least one contact method
        if (!shareEmail && !sharePhone) {
          return {
            inquiry: null,
            errors: [{ field: null, message: 'Must share at least one contact method' }]
          };
        }

        // Update the inquiry
        const updatedInquiry = await context.prisma.inquiry.update({
          where: { id: inquiryId },
          data: {
            status: 'ACCEPTED',
            shareEmail,
            sharePhone,
            respondedAt: new Date()
          },
          include: {
            buyer: {
              select: safeUserSelect
            },
            seller: {
              select: safeUserSelect
            },
            listing: {
              include: { 
                seller: {
                  select: safeUserSelect
                }
              }
            }
          }
        });

        return {
          inquiry: updatedInquiry,
          errors: []
        };
      } catch (error) {
        console.error('Error accepting inquiry:', error);
        return {
          inquiry: null,
          errors: [{ field: null, message: 'Failed to accept inquiry' }]
        };
      }
    },

    rejectContactRequest: async (
      _: any,
      { inquiryId }: { inquiryId: string },
      context: GraphQLContext
    ) => {
      if (!context.userId) {
        return {
          inquiry: null,
          errors: [{ field: null, message: 'Not authenticated' }]
        };
      }

      try {
        // Get the inquiry
        const inquiry = await context.prisma.inquiry.findUnique({
          where: { id: inquiryId },
          include: {
            buyer: {
              select: safeUserSelect
            },
            seller: {
              select: safeUserSelect
            },
            listing: {
              include: { 
                seller: {
                  select: safeUserSelect
                }
              }
            }
          }
        });

        if (!inquiry) {
          return {
            inquiry: null,
            errors: [{ field: 'inquiryId', message: 'Inquiry not found' }]
          };
        }

        // Only seller can reject
        if (inquiry.sellerId !== context.userId) {
          return {
            inquiry: null,
            errors: [{ field: null, message: 'Not authorized' }]
          };
        }

        // Only pending inquiries can be rejected
        if (inquiry.status !== 'PENDING') {
          return {
            inquiry: null,
            errors: [{ field: null, message: 'Inquiry has already been responded to' }]
          };
        }

        // Update the inquiry
        const updatedInquiry = await context.prisma.inquiry.update({
          where: { id: inquiryId },
          data: {
            status: 'REJECTED',
            respondedAt: new Date()
          },
          include: {
            buyer: {
              select: safeUserSelect
            },
            seller: {
              select: safeUserSelect
            },
            listing: {
              include: { 
                seller: {
                  select: safeUserSelect
                }
              }
            }
          }
        });

        return {
          inquiry: updatedInquiry,
          errors: []
        };
      } catch (error) {
        console.error('Error rejecting inquiry:', error);
        return {
          inquiry: null,
          errors: [{ field: null, message: 'Failed to reject inquiry' }]
        };
      }
    },
    
    respondToInquiry: async (
      _: any,
      { inquiryId, accept, shareEmail, sharePhone }: {
        inquiryId: string;
        accept: boolean;
        shareEmail: boolean;
        sharePhone: boolean;
      },
      context: GraphQLContext
    ) => {
      if (!context.userId) {
        return {
          inquiry: null,
          errors: [{ field: null, message: 'Not authenticated' }]
        };
      }

      try {
        // Get the inquiry
        const inquiry = await context.prisma.inquiry.findUnique({
          where: { id: inquiryId },
          include: {
            buyer: {
              select: safeUserSelect
            },
            seller: {
              select: safeUserSelect
            },
            listing: {
              include: { 
                seller: {
                  select: safeUserSelect
                }
              }
            }
          }
        });

        if (!inquiry) {
          return {
            inquiry: null,
            errors: [{ field: 'inquiryId', message: 'Inquiry not found' }]
          };
        }

        // Only seller can respond
        if (inquiry.sellerId !== context.userId) {
          return {
            inquiry: null,
            errors: [{ field: null, message: 'Not authorized' }]
          };
        }

        // Only pending inquiries can be responded to
        if (inquiry.status !== 'PENDING') {
          return {
            inquiry: null,
            errors: [{ field: null, message: 'Inquiry has already been responded to' }]
          };
        }

        // Update the inquiry
        const updatedInquiry = await context.prisma.inquiry.update({
          where: { id: inquiryId },
          data: {
            status: accept ? 'ACCEPTED' : 'REJECTED',
            shareEmail: accept ? shareEmail : false,
            sharePhone: accept ? sharePhone : false,
            respondedAt: new Date()
          },
          include: {
            buyer: {
              select: safeUserSelect
            },
            seller: {
              select: safeUserSelect
            },
            listing: {
              include: { 
                seller: {
                  select: safeUserSelect
                }
              }
            }
          }
        });

        return {
          inquiry: updatedInquiry,
          errors: []
        };
      } catch (error) {
        console.error('Error responding to inquiry:', error);
        return {
          inquiry: null,
          errors: [{ field: null, message: 'Failed to respond to inquiry' }]
        };
      }
    }
  },

  Inquiry: {
    // Only show contact info if status is ACCEPTED and user is the buyer
    contactEmail: async (inquiry: any, _: any, context: GraphQLContext) => {
      if (inquiry.status !== 'ACCEPTED' || !inquiry.shareEmail) {
        return null;
      }
      if (context.userId !== inquiry.buyerId) {
        return null;
      }
      // Fetch seller with email since it's not included in safeUserSelect
      const seller = await context.prisma.user.findUnique({
        where: { id: inquiry.sellerId },
        select: { email: true }
      });
      return seller?.email || null;
    },
    
    contactPhone: async (inquiry: any, _: any, context: GraphQLContext) => {
      if (inquiry.status !== 'ACCEPTED' || !inquiry.sharePhone) {
        return null;
      }
      if (context.userId !== inquiry.buyerId) {
        return null;
      }
      // Fetch seller with phone since it's not included in safeUserSelect
      const seller = await context.prisma.user.findUnique({
        where: { id: inquiry.sellerId },
        select: { phone: true }
      });
      return seller?.phone || null;
    }
  },

  Listing: {
    hasInquired: async (listing: any, _: any, context: GraphQLContext) => {
      if (!context.userId) {
        return false;
      }

      const inquiry = await context.prisma.inquiry.findUnique({
        where: {
          buyerId_listingId: {
            buyerId: context.userId,
            listingId: listing.id
          }
        }
      });

      return !!inquiry;
    },

    pendingInquiriesCount: async (listing: any, _: any, context: GraphQLContext) => {
      // Only show count to the seller
      if (!context.userId || listing.sellerId !== context.userId) {
        return null;
      }

      return context.prisma.inquiry.count({
        where: {
          listingId: listing.id,
          status: 'PENDING'
        }
      });
    },
    
    inquiries: async (listing: any, _: any, context: GraphQLContext) => {
      // Only the seller can see inquiries for their listing
      if (!context.userId || listing.sellerId !== context.userId) {
        return null;
      }
      
      const inquiries = await context.prisma.inquiry.findMany({
        where: {
          listingId: listing.id
        },
        include: {
          buyer: {
            select: safeUserSelect
          },
          seller: {
            select: safeUserSelect
          },
          listing: {
            include: { 
              seller: {
                select: safeUserSelect
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      return inquiries;
    }
  }
};