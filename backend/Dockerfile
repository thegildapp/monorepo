FROM node:18-alpine

WORKDIR /app

# Copy shared package
COPY packages/shared-schema /packages/shared-schema

# Now set up backend
COPY backend/package*.json ./

# Ensure the local package is linked properly
RUN mkdir -p node_modules/@gild && \
    ln -s /packages/shared-schema node_modules/@gild/shared-schema

RUN npm install --legacy-peer-deps

COPY backend/ .

# Generate Prisma clients
RUN npx prisma generate
RUN npx prisma generate --schema=./prisma-logs/schema.prisma

RUN npm run build

EXPOSE 4000

CMD ["npm", "start"]