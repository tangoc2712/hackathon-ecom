# Multi-stage build for smaller production image
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --only=production

# Generate Prisma Client for production
RUN npx prisma generate

# Copy built application from builder stage
COPY --from=builder /app/build ./build

# Copy Firebase service account key if it exists (for local testing)
# In Cloud Run, this will use default service account
COPY firebaseServiceAccountKey.json* ./

# Expose port (Cloud Run will set PORT env var)
EXPOSE 8080

# Set NODE_ENV to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "build/index.js"]
