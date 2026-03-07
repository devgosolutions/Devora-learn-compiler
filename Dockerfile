FROM node:20-bullseye

RUN apt-get update && apt-get install -y docker.io

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
