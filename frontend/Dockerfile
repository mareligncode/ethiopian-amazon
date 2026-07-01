# Build stage
FROM node:20 as build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source files and build the project
COPY . .
RUN npm run build

# Serve stage
FROM nginx:alpine

# Copy built Vite assets to Nginx html folder
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 inside the container
EXPOSE 80

# Copy custom nginx configuration to handle React Router routes
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
