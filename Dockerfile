FROM node:22.13.1

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["sh", "-c", "sleep 5 && npx knex migrate:latest && npm run start"]
