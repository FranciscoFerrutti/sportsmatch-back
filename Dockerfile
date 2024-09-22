FROM node:hydrogen-alpine3.17 as builder

ENV NODE_OPTIONS="--max-old-space-size=8196"

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:server"]
