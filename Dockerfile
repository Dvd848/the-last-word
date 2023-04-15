# Use alpine Linux as the base image
FROM node:alpine

RUN apk add --no-cache bash python3 build-base

RUN npm install -g npm@latest

# Create a directory for our app
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install the dependencies
#RUN npm install

#COPY . .

# Define a volume for the app
#VOLUME /app

# Expose the port that the app will listen on
EXPOSE 3000

# Start the app
#CMD ["npm", "start"]
#CMD ["sh"]

#docker run -it --rm -v ${PWD}:/app -p 3000:3000 the-last-word