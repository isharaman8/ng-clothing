FROM node:21-slim

WORKDIR /usr/src/app

COPY package*.json .

RUN npm i

COPY . ./

EXPOSE 3008

CMD [ "npm", "run" , "start:dev"]