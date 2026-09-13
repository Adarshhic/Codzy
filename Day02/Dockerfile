FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and prisma schema first for caching & postinstall hook
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (runs postinstall prisma generate with schema present)
RUN npm ci --only=production

# Copy remaining application source code
COPY . .

# Set default environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose server port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start the application
CMD ["npm", "start"]
