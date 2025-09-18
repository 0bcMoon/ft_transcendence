FROM node:22-alpine3.20

WORKDIR /usr/local/app

COPY package*.json .

RUN npm install

CMD ["npm", "run", "dev"]
