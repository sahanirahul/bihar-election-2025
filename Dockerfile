# Dockerfile for Bihar Election Calculator
# Serves both frontend and backend together in one container

FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy all backend files
COPY backend/ ./backend/

# Copy frontend files
COPY index.html ./
COPY config.js ./
COPY *.jpg ./

# Expose port (Render will set PORT env variable)
EXPOSE 3000

# Start the combined server
CMD ["node", "backend/server-combined.js"]

