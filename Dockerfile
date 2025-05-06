# FROM  node:23:9:0
# WORKDIR /app
# COPY  package*.json
# RUN npm install 
# copy . .
# EXPOSE 5174
# CMD ["npm", "start"]

FROM node:23.9.0

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (for dependency installation)
COPY package*.json ./

# Install dependencies inside the container
RUN npm install

# Copy the rest of your application files into the container
COPY . .

# Expose the port your app will run on (5174 for Vite in your case)
EXPOSE 5174

# Command to start the app
CMD ["npm", "start"]
