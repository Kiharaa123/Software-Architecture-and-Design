#!/bin/sh
set -e

# Wait for the database to be ready
echo "Waiting for the database to be ready..."
until nc -z -v -w30 db 5432; do
  echo "Waiting for database connection..."
  sleep 1
done
echo "Database is up and running!"

# Wait an additional 10 seconds for the database to initialize
echo "Waiting an additional 10 seconds for the database to initialize..."
sleep 10


# Install dependencies
echo "Installing dependencies..."
pnpm install

# Reset the database
echo "Resetting the database..."
pnpm prisma migrate reset --force

# Run Prisma migrations
echo "Running database migrations..."
pnpm prisma migrate dev

# Seed the database
echo "Seeding the database..."
pnpm prisma:seed

# Start the development server
echo "Starting the development server..."
exec pnpm start:dev