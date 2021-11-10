FROM node:14.18.1-alpine

WORKDIR /usr/kenzie-rover

COPY . .

RUN npm install -g npm@latest
RUN npm install -g typescript
RUN npm install
RUN npm run build