import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create test users with hashed passwords
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      password: hashedPassword,
      name: 'John Doe',
      phone: '+1234567890',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      password: hashedPassword,
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
      price: 450000, // $450,000
      images: [
        'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800',
        'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800',
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'
      ],
      city: 'Miami',
      state: 'FL',
      latitude: 25.7617,
      longitude: -80.1918,
      sellerId: user1.id,
      status: 'APPROVED',
    },
  });

  const planeListing = await prisma.listing.create({
    data: {
      title: 'Cessna 172 Skyhawk - Low Hours',
      description: 'Well-maintained training aircraft with modern avionics. Recent annual inspection.',
      price: 125000, // $125,000
      images: [
        'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800',
        'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800',
        'https://images.unsplash.com/photo-1529258283598-8d6fe60b27f4?w=800'
      ],
      city: 'Van Nuys',
      state: 'CA',
      latitude: 34.2097,
      longitude: -118.4897,
      sellerId: user2.id,
      status: 'APPROVED',
    },
  });

  const bikeListing = await prisma.listing.create({
    data: {
      title: 'Harley Davidson Street Glide',
      description: 'Touring bike with all the bells and whistles. Low miles, garage kept.',
      price: 22000, // $22,000
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800',
        'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800',
        'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=800'
      ],
      city: 'Austin',
      state: 'TX',
      latitude: 30.2672,
      longitude: -97.7431,
      sellerId: user1.id,
      status: 'APPROVED',
    },
  });

  const carListing = await prisma.listing.create({
    data: {
      title: 'Tesla Model S Long Range',
      description: 'Electric luxury sedan with autopilot. Full self-driving capability.',
      price: 75000, // $75,000
      images: [
        'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
        'https://images.unsplash.com/photo-1617704548623-340376564e68?w=800'
      ],
      city: 'San Francisco',
      state: 'CA',
      latitude: 37.7749,
      longitude: -122.4194,
      sellerId: user2.id,
      status: 'APPROVED',
    },
  });

  // Create more listings
  const vintageCar = await prisma.listing.create({
    data: {
      title: '1967 Ford Mustang Fastback',
      description: 'Restored classic muscle car. Numbers matching, pristine condition.',
      price: 85000, // $85,000
      images: [
        'https://images.unsplash.com/photo-1626668011687-8a114cf5a34c?w=800',
        'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800',
        'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800'
      ],
      city: 'Los Angeles',
      state: 'CA',
      latitude: 34.0522,
      longitude: -118.2437,
      sellerId: user1.id,
      status: 'APPROVED',
    },
  });

  const rvListing = await prisma.listing.create({
    data: {
      title: 'Airstream Classic 30RB',
      description: 'Luxury travel trailer. Solar equipped, perfect for off-grid adventures.',
      price: 95000, // $95,000
      images: [
        'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800',
        'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800',
        'https://images.unsplash.com/photo-1516939884455-1445c8652f83?w=800'
      ],
      city: 'Denver',
      state: 'CO',
      latitude: 39.7392,
      longitude: -104.9903,
      sellerId: user2.id,
      status: 'APPROVED',
    },
  });

  const jetSki = await prisma.listing.create({
    data: {
      title: 'Yamaha FX Cruiser SVHO',
      description: 'High performance personal watercraft. Only 50 hours on engine.',
      price: 18000, // $18,000
      images: [
        'https://images.unsplash.com/photo-1599678541744-90fdf7dce196?w=800',
        'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800'
      ],
      city: 'Tampa',
      state: 'FL',
      latitude: 27.9506,
      longitude: -82.4572,
      sellerId: user1.id,
      status: 'APPROVED',
    },
  });

  const sportsCar = await prisma.listing.create({
    data: {
      title: '2023 Porsche 911 Turbo S',
      description: 'Track-ready sports car. Carbon ceramic brakes, sport exhaust.',
      price: 250000, // $250,000
      images: [
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'
      ],
      city: 'Scottsdale',
      state: 'AZ',
      latitude: 33.4942,
      longitude: -111.9261,
      sellerId: user2.id,
      status: 'APPROVED',
    },
  });

  console.log('✅ Created listings:', {
    boatListing,
    planeListing,
    bikeListing,
    carListing,
    vintageCar,
    rvListing,
    jetSki,
    sportsCar,
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