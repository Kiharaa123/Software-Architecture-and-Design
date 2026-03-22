# Architecture for Ride-Sharing Backend

## Technical Summary

This architecture defines a scalable, secure backend system for a ride-sharing application built with NestJS. The system follows a modular design pattern with clear separation of concerns, using PostgreSQL with Prisma ORM for data persistence. It includes authentication, authorization, logging, and API documentation capabilities. The system is designed to handle user management, driver-customer interactions, ride scheduling, and location tracking.

## Technology Table

| Technology | Description                                                                   |
| ---------- | ----------------------------------------------------------------------------- |
| NestJS     | Progressive Node.js framework for building efficient server-side applications |
| TypeScript | Strongly typed programming language for application development               |
| PostgreSQL | Relational database for data persistence                                      |
| PostGIS    | Spatial database extension for geographic data processing                     |
| Prisma     | Next-generation ORM for database access and management                        |
| JWT        | Token-based authentication mechanism                                          |
| Passport   | Authentication middleware for Node.js                                         |
| Swagger    | API documentation and testing                                                 |
| Zod        | TypeScript-first schema validation                                            |
| Pino       | Ultra-fast Node.js logger                                                     |
| Docker     | Containerization platform (implied from structure)                            |
| Jest       | Testing framework for unit and integration tests                              |

## Architecture Diagrams

```mermaid
graph TD
    Client[Client Applications] -->|HTTP/REST| API[API Gateway]
    API --> Auth[Auth Module]
    API --> User[User Module]
    API --> Driver[Driver Module]
    API --> Customer[Customer Module]
    API --> Ride[Ride Module]
    API --> Location[Location Module]

    Auth --> Prisma[Prisma Service]
    User --> Prisma
    Driver --> Prisma
    Customer --> Prisma
    Ride --> Prisma
    Location --> Prisma

    Prisma -->|SQL| DB[(PostgreSQL + PostGIS)]

    style Client fill:#f9f,stroke:#333
    style API fill:#bbf,stroke:#333
    style Prisma fill:#bfb,stroke:#333
    style DB fill:#fbb,stroke:#333
```

```mermaid
sequenceDiagram
    actor Customer
    actor Driver
    participant Auth as Auth Service
    participant RideService as Ride Service
    participant LocationService as Location Service
    participant DB as Database

    Customer->>Auth: Login
    Auth->>DB: Validate credentials
    Auth-->>Customer: JWT token

    Customer->>RideService: Request ride
    RideService->>LocationService: Track customer location
    LocationService->>DB: Store location data
    RideService->>DB: Create ride request

    Driver->>Auth: Login
    Auth->>DB: Validate credentials
    Auth-->>Driver: JWT token

    Driver->>RideService: Accept ride
    RideService->>DB: Update ride status
    RideService-->>Customer: Notify driver accepted

    Driver->>LocationService: Update location
    LocationService->>DB: Store location updates
    LocationService-->>Customer: Share driver location

    Driver->>RideService: Complete ride
    RideService->>DB: Update ride status
    RideService-->>Customer: Notify ride completed
```

## Project Structure

```
/
├── prisma/                  # Database schema and migrations
│   ├── schema.prisma        # Prisma schema definition
│   ├── migrations/          # Database migrations
│   └── seed.ts              # Seed data for development
├── src/
│   ├── common/              # Shared utilities and helpers
│   │   └── interceptors/    # Global interceptors
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
├── test/                    # Test files
├── dist/                    # Compiled output
└── node_modules/            # Dependencies
```

Each module follows NestJS's recommended structure:

- Controllers: Handle HTTP requests and define API endpoints
- Services: Implement business logic
- DTOs: Define data transfer objects for validation
- Entities: Map to database models
- Repositories (via Prisma): Handle data access
