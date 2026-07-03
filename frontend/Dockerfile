FROM node:20-alpine

WORKDIR /app

# Install dependencies first (for caching)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source files
COPY . .

# Expose frontend port
EXPOSE 3000

# Default command (overridden by docker-compose in dev)
CMD ["npm", "run", "dev"]
