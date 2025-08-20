FROM node:18-slim
WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y curl netcat-openbsd && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci     # garde toutes les deps pour prisma generate

COPY . .

RUN npx prisma generate || true
RUN chmod +x ./docker-entrypoint.sh
RUN npm prune --omit=dev || true

EXPOSE 5000
ENTRYPOINT ["./docker-entrypoint.sh"]
