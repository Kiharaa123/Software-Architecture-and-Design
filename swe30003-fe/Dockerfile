# Use a non-Alpine Node.js image for better compatibility
FROM node:18 AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Use a lightweight Nginx image to serve the built application
FROM nginx:alpine AS production

# Copy the built application from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the default Nginx port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]