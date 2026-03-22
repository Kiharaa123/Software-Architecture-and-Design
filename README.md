
1. **Clone the Repository**:

   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. **Set Up Environment Variables**:

   - Replace `.env.template` with your `.env` file and configure the necessary variables.

3. **Start the Application**:
   - Run the following command to start the services using Docker:
     ```bash
     docker compose up -d
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
http://localhost:10000/docs
```

Core endpoints include:

- **Auth**: `/api/auth/login`, `/api/auth/register`
- **Users**: `/api/users`
- **Drivers**: `/api/drivers`
- **Customers**: `/api/customers`
- **Rides**: `/api/rides`
- **Locations**: `/api/locations`

## Project Structure

Backend

```
swe30003-be/
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

Frontend

```
swe30003-fe/
├── public/                  # Static assets
│   └── vite.svg             # Vite logo
├── src/                     # Frontend source code
│   ├── assets/              # Static assets like images or icons
│   │   └── react.svg        # React logo
│   ├── components/          # Reusable React components
│   │   └── MapComponent.tsx # Map component
│   ├── store/               # Redux store and slices
│   │   ├── index.ts         # Store configuration
│   │   └── tripSlice.ts     # Trip-related state management
│   ├── App.css              # Global styles for the App component
│   ├── App.tsx              # Main App component
│   ├── index.css            # Global CSS styles
│   ├── main.tsx             # Application entry point
│   └── vite-env.d.ts        # Vite environment types
├── Dockerfile               # Frontend Dockerfile
├── eslint.config.js         # ESLint configuration
├── index.html               # HTML template for the application
├── package.json             # Project dependencies and scripts
├── README.md                # Frontend-specific README
├── tailwind.config.js       # TailwindCSS configuration
├── tsconfig.app.json        # TypeScript configuration for the app
├── tsconfig.json            # Base TypeScript configuration
├── tsconfig.node.json       # TypeScript configuration for Node.js
└── vite.config.ts           # Vite configuration
```

## Architecture

For detailed architecture information, see [architecture.md](./swe30003-be/docs/architecture.md)

## API reference

For detailed API reference information, see [api-reference.md](./swe30003-be/docs/api-reference.md)

## Data model

For detailed Data model information, see [data-models.md](./swe30003-be/docs/data-models.md)
>>>>>>> 8e902a7 (DONE)
