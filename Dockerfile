# Build client (vite) + compile server (tsc) with full dependencies available.
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
COPY server/package*.json server/
COPY client/package*.json client/
RUN npm ci
COPY . .
RUN npm run build

# Lean runtime image: only the server's production dependencies plus built output.
FROM node:22-slim
ENV NODE_ENV=production
WORKDIR /app/server
COPY server/package*.json ./
COPY --from=build /app/server/prisma ./prisma
RUN npm ci --omit=dev
COPY --from=build /app/server/dist ./dist
COPY --from=build /app/client/dist ../client/dist

EXPOSE 3001
CMD ["npm", "run", "start"]
