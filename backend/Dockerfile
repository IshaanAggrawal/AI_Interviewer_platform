# ─── Stage 1: Build ───
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies needed for node-gyp and native modules (like pdf-parse if needed)
RUN apk add --no-cache python3 make g++ 

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for TypeScript)
RUN npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code
COPY . .

# Build the TypeScript project
RUN npm run build

# ─── Stage 2: Production ───
FROM node:20-alpine AS runner

# Set environment to production
ENV NODE_ENV=production

# Render Free Tier gives 512MB of RAM. 
# We restrict Node's garbage collector to ~400MB so it doesn't exceed the limit and crash.
ENV NODE_OPTIONS="--max-old-space-size=400"

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install ONLY production dependencies (keeps image size very small)
RUN npm ci --omit=dev

# Copy generated Prisma client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy built JavaScript files
COPY --from=builder /app/dist ./dist

# Ensure the container runs as a non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S expressjs -u 1001
USER expressjs

# Expose port
EXPOSE 8000

# Start the server
CMD ["node", "dist/server.js"]
