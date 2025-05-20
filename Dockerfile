FROM node:22.15.1

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD npx nodemon --inspect=0.0.0.0 index.js --host localhost --port 3000