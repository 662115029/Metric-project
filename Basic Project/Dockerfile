# Use official Node.js LTS image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy all project files
COPY . .

# Set environment variables (these will be overridden in Docker Compose)
ENV PORT=3000

# Expose the application port
EXPOSE 3000

# Start the app
CMD ["node", "server.js"]
