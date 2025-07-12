import { PrismaClient, CategoryType } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create test users
  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      name: 'John Doe',
      phone: '+1234567890',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      name: 'Jane Smith',
      phone: '+0987654321',
    },
  });

  console.log('✅ Created users:', { user1, user2 });

  // Create listings
  const boatListing = await prisma.listing.create({
    data: {
      title: 'Luxury Yacht - 2020 Sea Ray 400',
      description: 'Beautiful 40ft yacht in excellent condition. Perfect for weekend getaways.',
      price: 450000,
      category: CategoryType.BOATS,
      images: ['https://example.com/boat1.jpg', 'https://example.com/boat2.jpg'],
      city: 'Miami',
      state: 'FL',
      latitude: 25.7617,
      longitude: -80.1918,
      sellerId: user1.id,
      specifications: {
        length: 40,
        year: 2020,
        make: 'Sea Ray',
        model: '400 Sundancer',
        hullMaterial: 'Fiberglass',
        engineType: 'Twin Mercruiser',
        horsepower: 600,
      },
    },
  });

  const planeListing = await prisma.listing.create({
    data: {
      title: 'Cessna 172 Skyhawk - Low Hours',
      description: 'Well-maintained training aircraft with modern avionics.',
      price: 125000,
      category: CategoryType.PLANES,
      images: ['https://example.com/plane1.jpg'],
      city: 'Van Nuys',
      state: 'CA',
      latitude: 34.2097,
      longitude: -118.4897,
      sellerId: user2.id,
      specifications: {
        year: 2015,
        make: 'Cessna',
        model: '172S Skyhawk',
        hours: 850,
        engineType: 'Lycoming IO-360',
        seats: 4,
      },
    },
  });

  const bikeListing = await prisma.listing.create({
    data: {
      title: 'Harley Davidson Street Glide',
      description: 'Touring bike with all the bells and whistles.',
      price: 22000,
      category: CategoryType.BIKES,
      images: ['https://example.com/bike1.jpg', 'https://example.com/bike2.jpg'],
      city: 'Austin',
      state: 'TX',
      latitude: 30.2672,
      longitude: -97.7431,
      sellerId: user1.id,
      specifications: {
        year: 2021,
        make: 'Harley Davidson',
        model: 'Street Glide',
        engineSize: 1868,
        mileage: 5000,
      },
    },
  });

  const carListing = await prisma.listing.create({
    data: {
      title: 'Tesla Model S Long Range',
      description: 'Electric luxury sedan with autopilot.',
      price: 75000,
      category: CategoryType.CARS,
      images: ['https://example.com/car1.jpg'],
      city: 'San Francisco',
      state: 'CA',
      latitude: 37.7749,
      longitude: -122.4194,
      sellerId: user2.id,
      specifications: {
        year: 2022,
        make: 'Tesla',
        model: 'Model S',
        mileage: 15000,
        transmission: 'Automatic',
        fuelType: 'Electric',
      },
    },
  });

  console.log('✅ Created listings:', {
    boatListing,
    planeListing,
    bikeListing,
    carListing,
  });

  console.log('🌱 Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });