# Use the official Node.js 18 Alpine image
FROM node:18-alpine

# Create a working directory
WORKDIR /usr/src/app

# Copy the package files from the root of your repository
# (Assumes you have a root-level package.json and lock file responsible for both frontend & backend dependencies)
COPY package*.json ./

# Install root-level dependencies (including 'concurrently' if you plan to run both services in one container)
RUN npm install

# Copy the backend code
COPY backend/ ./backend

# Copy the frontend code
COPY frontend/ ./frontend

# Expose ports for both backend (e.g., 5000) and frontend (e.g., 3000)
EXPOSE 5000
EXPOSE 3000

# Start both the frontend and backend in parallel
# Ensure your root-level package.json has a script like:
# "scripts": {
#   "start:both": "concurrently \"npm run start --prefix backend\" \"npm run start --prefix frontend\""
# }
CMD ["npm", "run", "start:both"]