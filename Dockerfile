# Stage 1: Build the React application
FROM node:20-alpine as builder
WORKDIR /app
# Copy package files and install dependencies
COPY package*.json ./
RUN npm install
# Copy the rest of the application
COPY . .
# Build the application for production
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine
# Copy the build output to replace the default nginx contents.
COPY --from=builder /app/dist /usr/share/nginx/html
# Expose port 80
EXPOSE 80
# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
