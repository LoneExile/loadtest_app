FROM node:22-alpine AS build

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install dependencies for production only
RUN npm i

# Bundle app source
COPY server.js logger.js ./

# Create a smaller production image
FROM node:22-alpine

# Set NODE_ENV to production
ENV NODE_ENV production

# Create app directory
WORKDIR /usr/src/app

# Copy only necessary files from build stage
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/server.js ./
COPY --from=build /usr/src/app/logger.js ./

# Use a non-root user for better security
USER node

# Expose the port the app runs on
EXPOSE 3003

# Command to run the application
CMD ["node", "server.js"]
