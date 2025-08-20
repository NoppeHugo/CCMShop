FROM node:18-slim

WORKDIR /usr/src/app

# Copy package files first (caching)
COPY package.json package-lock.json ./

# Install deps
RUN npm ci --production

# Copy app
COPY . .

# Generate Prisma client
RUN npx prisma generate || true

# Make entrypoint executable
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 5000

# Entrypoint will run migrations then start the server
ENTRYPOINT ["./docker-entrypoint.sh"]