# Use Node.js image
FROM node:18-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++ bash git \
    && ln -sf python3 /usr/bin/python

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally
RUN npm install -g pnpm

# Copy the rest of the application code
COPY . .

# Make the entrypoint script executable
RUN chmod +x ./entrypoint.sh

# Expose the application port
EXPOSE 10000

# Set the entry point
ENTRYPOINT ["sh", "./entrypoint.sh"]