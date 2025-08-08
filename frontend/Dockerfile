# Build stage
FROM node:20-alpine AS build

# Accept build arguments
ARG VITE_GRAPHQL_URL
ARG VITE_SPACES_ENDPOINT
ARG VITE_GOOGLE_PLACES_API_KEY
ARG VITE_STRIPE_PUBLISHABLE_KEY

WORKDIR /app

# Copy shared package
COPY packages/shared-schema /packages/shared-schema

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY frontend/ .

# Copy schema from shared package
RUN cp /packages/shared-schema/schema.graphql ./schema.graphql

# Generate types from GraphQL schema
RUN npm run relay

# Set environment variables for build
ENV VITE_GRAPHQL_URL=$VITE_GRAPHQL_URL
ENV VITE_SPACES_ENDPOINT=$VITE_SPACES_ENDPOINT
ENV VITE_GOOGLE_PLACES_API_KEY=$VITE_GOOGLE_PLACES_API_KEY
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY

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