# Build stage
FROM node:20-alpine AS build

# Accept build arguments
ARG VITE_GRAPHQL_URL
ARG VITE_SPACES_ENDPOINT

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

# Set environment variables for build
ENV VITE_GRAPHQL_URL=$VITE_GRAPHQL_URL
ENV VITE_SPACES_ENDPOINT=$VITE_SPACES_ENDPOINT

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