FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm install --legacy-peer-deps

# Copy the shared schema file
COPY schema.graphql ./

COPY backend/ .

# Generate Prisma client
RUN npx prisma generate

RUN npm run build

EXPOSE 4000

CMD ["npm", "start"]