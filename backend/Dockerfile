# Use the official Node.js alpine image matching your project runtime
FROM node:24-alpine

# Update system packages and npm to patch known vulnerabilities in the base image
RUN apk update && apk upgrade --no-cache && npm install -g npm@latest

# Set the working directory
WORKDIR /app

# Copy package definition files and set ownership to non-root 'node' user
COPY --chown=node:node package*.json ./

# Install dependencies (only production packages for smaller image size)
RUN npm ci --only=production

# Copy all backend source files and set ownership to 'node' user
COPY --chown=node:node . .

# Switch to the non-root user provided by the Node image
USER node

# Render dynamically sets PORT env variable, but we expose 3000 as metadata
EXPOSE 3000

# Start the server
CMD ["npm", "start"]

