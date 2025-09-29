# Build stage
FROM node:18-alpine AS build

# Install dependencies required for native modules
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies needed for build)
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install ALL dependencies (TypeScript needed for next.config.ts)
COPY package*.json ./
RUN npm ci

# Copy built assets from build stage
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.* ./

# Expose port 3000
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start Next.js
CMD ["npm", "start"]
