FROM node:latest

RUN mkdir -p /dockerapp/src

WORKDIR /dockerapp/src

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "start"]
