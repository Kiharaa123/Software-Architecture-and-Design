import {
  PrismaClient,
  UserRole,
  VehicleType,
  RideStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// Generate a CUID (a type of unique ID used by Prisma)
function generateCuid() {
  return 'c' + randomUUID().replace(/-/g, '');
}

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function main() {
  // Clean up existing data
  await prisma.$executeRaw`TRUNCATE TABLE "Location" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Ride" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Customer" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Driver" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;

  console.log('Seeding database...');

  // Create users with customers and drivers
  const customers = [];
  const drivers = [];

  // Create 5 customers
  for (let i = 1; i <= 5; i++) {
    const email = `customer${i}@example.com`;
    const user = await prisma.user.create({
      data: {
        email,
        normalizedEmail: email.toLowerCase(),
        password: await hashPassword('password'),
        firstName: `Khách`,
        lastName: `Hàng${i}`,
        phone: `+8498${1000000 + i}`,
        address: `${100 + i} Đường Nguyễn Huệ, Quận 1, TP.HCM`,
        role: UserRole.CUSTOMER,
      },
    });

    const customer = await prisma.customer.create({
      data: {
        userId: user.id,
      },
      include: {
        user: true,
      },
    });

    customers.push(customer);
    console.log(
      `Created customer ${i}: ${customer.user.firstName} ${customer.user.lastName}`,
    );
  }

  // Create 5 drivers
  for (let i = 1; i <= 5; i++) {
    const email = `driver${i}@example.com`;
    const user = await prisma.user.create({
      data: {
        email,
        normalizedEmail: email.toLowerCase(),
        password: await hashPassword('password'),
        firstName: `Tài`,
        lastName: `Xế${i}`,
        phone: `+8490${2000000 + i}`,
        address: `${200 + i} Đường Lê Lợi, Quận 1, TP.HCM`,
        role: UserRole.DRIVER,
      },
    });

    const driver = await prisma.driver.create({
      data: {
        userId: user.id,
      },
      include: {
        user: true,
      },
    });

    drivers.push(driver);
    console.log(
      `Created driver ${i}: ${driver.user.firstName} ${driver.user.lastName}`,
    );
  }

  // Create sample locations
  const locations = [];
  const locationPairs = [
    // Ho Chi Minh City locations
    [
      { name: 'Bến Thành Market', lat: 10.7725, lng: 106.698 },
      { name: 'Landmark 81', lat: 10.7947, lng: 106.7215 },
    ],
    [
      { name: 'Saigon Notre-Dame Cathedral', lat: 10.7797, lng: 106.699 },
      { name: 'Tan Son Nhat Airport', lat: 10.8184, lng: 106.664 },
    ],
    [
      { name: 'Bitexco Financial Tower', lat: 10.772, lng: 106.7043 },
      { name: 'Saigon Central Post Office', lat: 10.7805, lng: 106.7 },
    ],
    [
      { name: 'War Remnants Museum', lat: 10.7793, lng: 106.6919 },
      { name: 'Saigon Zoo and Botanical Gardens', lat: 10.7874, lng: 106.7054 },
    ],
    [
      { name: 'Independence Palace', lat: 10.7771, lng: 106.6958 },
      { name: 'Nguyen Hue Walking Street', lat: 10.7731, lng: 106.7029 },
    ],
  ];

  for (const [pickup, dropoff] of locationPairs) {
    // Create pickup location using direct SQL for PostGIS compatibility
    const pickupId = generateCuid();
    await prisma.$executeRaw`
      INSERT INTO "Location" (id, name, coordinates, "createdAt", "updatedAt")
      VALUES (
        ${pickupId}, 
        ${pickup.name}, 
        ST_SetSRID(ST_MakePoint(${pickup.lng}, ${pickup.lat}), 4326)::geography,
        now(),
        now()
      )
    `;
    const pickupLocation = { id: pickupId, name: pickup.name };

    // Create dropoff location using direct SQL for PostGIS compatibility
    const dropoffId = generateCuid();
    await prisma.$executeRaw`
      INSERT INTO "Location" (id, name, coordinates, "createdAt", "updatedAt")
      VALUES (
        ${dropoffId}, 
        ${dropoff.name}, 
        ST_SetSRID(ST_MakePoint(${dropoff.lng}, ${dropoff.lat}), 4326)::geography,
        now(),
        now()
      )
    `;
    const dropoffLocation = { id: dropoffId, name: dropoff.name };

    locations.push({ pickup: pickupLocation, dropoff: dropoffLocation });
  }

  // Create 5 rides with different statuses
  const statuses = [
    RideStatus.PENDING,
    RideStatus.ACCEPTED,
    RideStatus.COMPLETED,
    RideStatus.CANCELLED,
    RideStatus.COMPLETED,
  ];

  const vehicleTypes = [
    VehicleType.CAR,
    VehicleType.LUXURY,
    VehicleType.CAR,
    VehicleType.BIKE,
    VehicleType.CAR,
  ];

  for (let i = 0; i < 5; i++) {
    // Assign a customer and driver (cycling through them)
    const customer = customers[i % customers.length];
    const driver = drivers[i % drivers.length];
    const { pickup, dropoff } = locations[i];

    // Calculate a mock price based on location
    const distance = 2 + Math.random() * 10; // 2-12 km
    const basePrice = 15000; // Base fare in VND
    const pricePerKm =
      vehicleTypes[i] === VehicleType.LUXURY
        ? 25000
        : vehicleTypes[i] === VehicleType.CAR
          ? 15000
          : 8000;
    const price = basePrice + distance * pricePerKm;

    const ride = await prisma.ride.create({
      data: {
        customerId: customer.id,
        driverId: driver.id,
        status: statuses[i],
        vehicleType: vehicleTypes[i],
        price: parseFloat(price.toFixed(0)),
        locations: {
          connect: [{ id: pickup.id }, { id: dropoff.id }],
        },
      },
      include: {
        customer: {
          include: {
            user: true,
          },
        },
        driver: {
          include: {
            user: true,
          },
        },
        locations: true,
      },
    });

    console.log(`Created ride ${i + 1} from ${pickup.name} to ${dropoff.name}`);
    console.log(
      `  Status: ${ride.status}, Vehicle: ${ride.vehicleType}, Price: ${ride.price.toLocaleString('vi-VN')} VND`,
    );
    console.log(
      `  Customer: ${ride.customer.user.firstName} ${ride.customer.user.lastName}`,
    );
    console.log(
      `  Driver: ${ride.driver.user.firstName} ${ride.driver.user.lastName}`,
    );
  }

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
