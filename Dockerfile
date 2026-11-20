FROM node:22-alpine AS client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY server/package*.json ./server/
RUN npm ci --omit=dev --prefix server
COPY server/ ./server/
COPY database/ ./database/
COPY --from=client /app/client/dist ./client/dist
EXPOSE 3001
CMD ["sh", "-c", "node server/scripts/init-db.js --if-empty && node server/src/index.js"]
