# Use Node.js as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema first
COPY prisma ./prisma

# Generate Prisma Client 
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

#  Prevent SWC binary download crash
ENV NEXT_DISABLE_SWC_DOWNLOAD=1

# Generate Database
#RUN npx prisma migrate dev --name init

# Build the Next.js application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
