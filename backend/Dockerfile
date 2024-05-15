FROM node:21.7.2-alpine

WORKDIR /app
COPY package*.json ./

RUN npm ci
COPY . .

EXPOSE 8080

CMD ["npm", "run", "start:dev"]
