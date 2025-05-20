FROM node:22.15.1

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD npx nodemon index.js --host localhost --port 3000