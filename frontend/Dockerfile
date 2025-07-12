# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy the shared schema file for code generation
COPY schema.graphql ./

# Copy source code
COPY frontend/ .

# Generate types from GraphQL schema
RUN npm run relay

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 5173
EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]