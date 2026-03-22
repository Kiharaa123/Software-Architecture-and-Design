# Ride-Sharing Backend

A scalable and secure backend API for a ride-sharing application built with NestJS.

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd swe30003-be

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Set up the database
pnpm prisma migrate dev
pnpm prisma:seed

# Start the development server
pnpm start:dev
```

## Features

- **User Management**: Registration, authentication, and profile management
- **Role-Based Access**: Support for customers and drivers
- **Ride Management**: Create, accept, track, and complete rides
- **Location Tracking**: Real-time location updates using PostGIS
- **Secured Endpoints**: JWT-based authentication
- **API Documentation**: Auto-generated Swagger docs

## Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with PostGIS extension
- **ORM**: Prisma
- **Auth**: JWT with Passport
- **Validation**: Zod and class-validator
- **Documentation**: Swagger/OpenAPI
- **Logging**: Pino

## API Endpoints

Once the server is running, access the Swagger documentation at:

```
http://localhost:3000/api/docs
```

Core endpoints include:

- **Auth**: `/api/auth/login`, `/api/auth/register`
- **Users**: `/api/users`
- **Drivers**: `/api/drivers`
- **Customers**: `/api/customers`
- **Rides**: `/api/rides`
- **Locations**: `/api/locations`

## Project Structure

```
/
├── prisma/                  # Database schema and migrations
├── src/
│   ├── common/              # Shared utilities and helpers
│   ├── prisma/              # Prisma service and utilities
│   ├── modules/             # Application modules
│   │   ├── app.module.ts    # Root application module
│   │   ├── auth/            # Authentication module
│   │   ├── user/            # User management module
│   │   ├── driver/          # Driver-specific functionality
│   │   ├── customer/        # Customer-specific functionality
│   │   ├── ride/            # Ride management module
│   │   └── location/        # Location tracking and management
│   └── main.ts              # Application entry point
└── docs/                    # Project documentation
    └── architecture.md      # Architecture documentation
```

## Development

```bash
# Start the development server with hot-reload
pnpm start:dev

# Lint the codebase
pnpm lint

# Run tests
pnpm test

# Generate Prisma client
pnpm prisma generate

# Create a migration
pnpm prisma migrate dev --name <migration-name>
```

## Common Issues

- **Database Connection Error**: Ensure PostgreSQL is running and credentials in `.env` are correct
- **PostGIS Extension**: Make sure PostGIS extension is enabled in your PostgreSQL instance
- **Prisma Error**: Run `pnpm prisma generate` after schema changes

## Environment Variables

Key environment variables include:

```
DATABASE_URL=postgresql://user:password@localhost:5432/ride_sharing
BACKEND_PORT=3000
JWT_SECRET=your_jwt_secret
GLOBAL_API_PREFIX=api
```

See `.env.example` for all required variables.

## Architecture

For detailed architecture information, see [architecture.md](./docs/architecture.md)

## License

[MIT licensed](LICENSE)
