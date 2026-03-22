---
title: SWE30003 API Reference
description: API documentation for the SWE30003 backend service
version: 1.0.0
---

# SWE30003 API Reference

## Overview

This API provides endpoints for managing users, customers, drivers, rides, and locations. It includes authentication flows, ride management, location services, and more.

```mermaid
---
title: API Authentication Flow
---
sequenceDiagram
    participant Client
    participant Auth API
    participant Resource API
    participant Database

    Client->>Auth API: POST /api/v1/auth/login
    Auth API->>Database: Validate credentials
    Database-->>Auth API: User exists
    Auth API-->>Client: 200 OK (JWT token)

    Client->>Resource API: GET /api/v1/resources
    Note right of Client: With Authorization header
    Resource API->>Auth API: Validate token
    Auth API-->>Resource API: Token valid
    Resource API->>Database: Fetch resources
    Database-->>Resource API: Resources data
    Resource API-->>Client: 200 OK (Resources)
```

## Authentication

Most endpoints require authentication using a JWT Bearer token, except for the user registration and login endpoints.

To authenticate requests, include an `Authorization` header with a valid JWT token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Lifecycle

- Access tokens expire after the configured timeframe
- Refresh tokens can be used to obtain new access tokens without re-authentication
- Use the refresh endpoint to obtain a new access token

## Endpoints

### Authorization

#### Login

> **POST** `/api/v1/auth/login`

Authenticates a user and returns access and refresh tokens.

#### Authentication

- Required: No

#### Request Body

| Field    | Type   | Required | Constraints                        | Description     |
| :------- | :----- | :------- | :--------------------------------- | :-------------- |
| email    | string | Yes      | Valid email format                 | User's email    |
| password | string | Yes      | Min 8 chars, with mixed characters | User's password |

```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123"
}
```

#### Response

##### 200 OK

```json
{
  "message": "User logged in",
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-id-123",
      "email": "user@example.com",
      "name": "User Name"
    }
  }
}
```

##### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Credentials are not valid.",
  "error": "Unauthorized"
}
```

#### Example Request

```bash
curl -X POST "https://api.example.com/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecureP@ss123"
  }'
```

#### Refresh Token

> **GET** `/api/v1/auth/refresh`

Refreshes the access token using a valid refresh token.

#### Authentication

- Required: Yes
- Type: Bearer Token (Refresh token)

#### Response

##### 200 OK

```json
{
  "message": "Refreshed token",
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-id-123",
      "email": "user@example.com",
      "name": "User Name"
    }
  }
}
```

##### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "User not authenticated",
  "error": "Unauthorized"
}
```

#### Example Request

```bash
curl -X GET "https://api.example.com/api/v1/auth/refresh" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Users

#### Create User

> **POST** `/api/v1/users`

Creates a new user account.

#### Authentication

- Required: No

#### Request Body

| Field    | Type   | Required | Constraints                        | Description      |
| :------- | :----- | :------- | :--------------------------------- | :--------------- |
| email    | string | Yes      | Valid email format                 | User's email     |
| password | string | Yes      | Min 8 chars, 1 number, 1 uppercase | User's password  |
| name     | string | Yes      | 2-100 characters                   | User's full name |

```json
{
  "email": "new.user@example.com",
  "password": "SecureP@ss123",
  "name": "New User"
}
```

#### Response

##### 201 Created

```json
{
  "message": "User created",
  "statusCode": 201,
  "data": {
    "id": "user-id-123",
    "email": "new.user@example.com",
    "name": "New User"
  }
}
```

##### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": {
    "email": ["Email is already taken"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

#### Example Request

```bash
curl -X POST "https://api.example.com/api/v1/users" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "new.user@example.com",
    "password": "SecureP@ss123",
    "name": "New User"
  }'
```

### Rides

#### Create Ride

> **POST** `/api/v1/rides`

Creates a new ride.

#### Authentication

- Required: Yes
- Type: Bearer Token

#### Request Body

| Field       | Type   | Required | Description               |
| :---------- | :----- | :------- | :------------------------ |
| customerId  | string | Yes      | ID of the customer        |
| pickupLat   | number | Yes      | Pickup latitude           |
| pickupLng   | number | Yes      | Pickup longitude          |
| dropoffLat  | number | Yes      | Dropoff latitude          |
| dropoffLng  | number | Yes      | Dropoff longitude         |
| vehicleType | string | No       | Type of vehicle requested |

```json
{
  "customerId": "customer-id-123",
  "pickupLat": 10.762622,
  "pickupLng": 106.660172,
  "dropoffLat": 10.773831,
  "dropoffLng": 106.704895,
  "vehicleType": "SEDAN"
}
```

#### Response

##### 201 Created

```json
{
  "message": "Ride has been created successfully",
  "statusCode": 201,
  "data": {
    "id": "ride-id-123",
    "customerId": "customer-id-123",
    "driverId": null,
    "pickup": {
      "lat": 10.762622,
      "lng": 106.660172
    },
    "dropoff": {
      "lat": 10.773831,
      "lng": 106.704895
    },
    "status": "PENDING",
    "vehicleType": "SEDAN",
    "price": 50000,
    "distance": 5.6,
    "duration": 15,
    "createdAt": "2023-04-05T10:30:00Z",
    "updatedAt": "2023-04-05T10:30:00Z"
  }
}
```

#### Example Request

```bash
curl -X POST "https://api.example.com/api/v1/rides" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-id-123",
    "pickupLat": 10.762622,
    "pickupLng": 106.660172,
    "dropoffLat": 10.773831,
    "dropoffLng": 106.704895,
    "vehicleType": "SEDAN"
  }'
```

#### Update Ride Status

> **PUT** `/api/v1/rides/status`

Updates the status of a ride.

#### Authentication

- Required: Yes
- Type: Bearer Token

#### Request Body

| Field    | Type   | Required | Description                                     |
| :------- | :----- | :------- | :---------------------------------------------- |
| rideId   | string | Yes      | ID of the ride to update                        |
| status   | string | Yes      | New ride status                                 |
| driverId | string | No       | ID of the driver (required for ACCEPTED status) |

```json
{
  "rideId": "ride-id-123",
  "status": "ACCEPTED",
  "driverId": "driver-id-456"
}
```

#### Response

##### 200 OK

```json
{
  "message": "Ride status updated",
  "statusCode": 200,
  "data": {
    "id": "ride-id-123",
    "customerId": "customer-id-123",
    "driverId": "driver-id-456",
    "pickup": {
      "lat": 10.762622,
      "lng": 106.660172
    },
    "dropoff": {
      "lat": 10.773831,
      "lng": 106.704895
    },
    "status": "ACCEPTED",
    "vehicleType": "SEDAN",
    "price": 50000,
    "distance": 5.6,
    "duration": 15,
    "createdAt": "2023-04-05T10:30:00Z",
    "updatedAt": "2023-04-05T10:35:00Z"
  }
}
```

#### Example Request

```bash
curl -X PUT "https://api.example.com/api/v1/rides/status" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "rideId": "ride-id-123",
    "status": "ACCEPTED",
    "driverId": "driver-id-456"
  }'
```

#### Calculate Ride Price

> **GET** `/api/v1/rides/price`

Calculates the price for a ride between two points.

#### Authentication

- Required: Yes
- Type: Bearer Token

#### Query Parameters

| Parameter   | Type   | Required | Description       |
| :---------- | :----- | :------- | :---------------- |
| pickupLat   | number | Yes      | Pickup latitude   |
| pickupLng   | number | Yes      | Pickup longitude  |
| dropoffLat  | number | Yes      | Dropoff latitude  |
| dropoffLng  | number | Yes      | Dropoff longitude |
| vehicleType | string | No       | Type of vehicle   |

#### Response

##### 200 OK

```json
{
  "message": "Returns calculated price information",
  "statusCode": 200,
  "data": {
    "price": 50000,
    "distance": 5.6,
    "duration": 15,
    "currency": "VND",
    "vehicleType": "SEDAN"
  }
}
```

#### Example Request

```bash
curl -X GET "https://api.example.com/api/v1/rides/price?pickupLat=10.762622&pickupLng=106.660172&dropoffLat=10.773831&dropoffLng=106.704895&vehicleType=SEDAN" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Get Ride by ID

> **GET** `/api/v1/rides/:id`

Retrieves details of a specific ride.

#### Authentication

- Required: Yes
- Type: Bearer Token

#### Path Parameters

| Parameter | Type   | Required | Description |
| :-------- | :----- | :------- | :---------- |
| id        | string | Yes      | The ride ID |

#### Response

##### 200 OK

```json
{
  "message": "Returns ride information",
  "statusCode": 200,
  "data": {
    "id": "ride-id-123",
    "customerId": "customer-id-123",
    "driverId": "driver-id-456",
    "pickup": {
      "lat": 10.762622,
      "lng": 106.660172
    },
    "dropoff": {
      "lat": 10.773831,
      "lng": 106.704895
    },
    "status": "ACCEPTED",
    "vehicleType": "SEDAN",
    "price": 50000,
    "distance": 5.6,
    "duration": 15,
    "createdAt": "2023-04-05T10:30:00Z",
    "updatedAt": "2023-04-05T10:35:00Z"
  }
}
```

##### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Ride not found",
  "error": "Not Found"
}
```

#### Example Request

```bash
curl -X GET "https://api.example.com/api/v1/rides/ride-id-123" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Location

#### Get Directions

> **GET** `/api/v1/location/directions`

Get directions between two points.

#### Authentication

- Required: Yes
- Type: Bearer Token

#### Query Parameters

| Parameter      | Type   | Required | Description                                 |
| :------------- | :----- | :------- | :------------------------------------------ |
| originLat      | number | Yes      | Origin latitude                             |
| originLng      | number | Yes      | Origin longitude                            |
| destinationLat | number | Yes      | Destination latitude                        |
| destinationLng | number | Yes      | Destination longitude                       |
| profile        | string | No       | Routing profile (driving, walking, cycling) |

#### Response

##### 200 OK

```json
{
  "message": "Returns detailed directions information",
  "statusCode": 200,
  "data": {
    "distance": 5.6,
    "duration": 15,
    "geometry": "encoded_polyline_string",
    "legs": [
      {
        "distance": 5.6,
        "duration": 15,
        "steps": [
          {
            "distance": 0.5,
            "duration": 2,
            "instruction": "Drive along Nguyen Hue Boulevard",
            "name": "Nguyen Hue",
            "type": "depart"
          }
        ]
      }
    ]
  }
}
```

#### Example Request

```bash
curl -X GET "https://api.example.com/api/v1/location/directions?originLat=10.762622&originLng=106.660172&destinationLat=10.773831&destinationLng=106.704895&profile=driving" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Error Handling

The API uses conventional HTTP response codes to indicate success or failure of requests:

| Code Range | Description                                     |
| :--------- | :---------------------------------------------- |
| 2xx        | Success                                         |
| 4xx        | Client errors (invalid request, authentication) |
| 5xx        | Server errors                                   |

### Common Error Codes

| Code | Description                                     |
| :--- | :---------------------------------------------- |
| 400  | Bad Request - Invalid input or validation error |
| 401  | Unauthorized - Authentication required          |
| 403  | Forbidden - Insufficient permissions            |
| 404  | Not Found - Resource does not exist             |
| 429  | Too Many Requests - Rate limit exceeded         |
| 500  | Internal Server Error - Server-side issue       |

### Error Response Format

All error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Human-readable error message",
  "error": "Error type",
  "details": {
    "field1": ["Error details for field1"],
    "field2": ["Error details for field2"]
  }
}
```

## Rate Limiting

API requests are limited to protect the service from abuse. Rate limit information is included in the response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1623766120
```

Exceeding the rate limit will result in a 429 Too Many Requests response.

## Versioning

The API uses versioning in the URL path:

```
https://api.example.com/api/v1/resource
```

When breaking changes are introduced, a new version will be released (e.g., `v2`).

> 💡 **Tip:** Always specify the API version in your requests to ensure compatibility.
