# Multi-stage build for pubkey API (keys_server)

# Stage 1: Base
FROM node:22.17.0-alpine AS base
WORKDIR /app

# Stage 2: Dependencies
FROM base AS deps
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci --ignore-scripts

# Stage 3: Build
FROM deps AS build
COPY . .
# Node.js app doesn't need compilation, just verify dependencies
RUN npm list --depth=0

# Stage 4: Final
FROM node:22.17.0-alpine
WORKDIR /app
RUN apk add --no-cache dumb-init
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app .
EXPOSE 3010
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
