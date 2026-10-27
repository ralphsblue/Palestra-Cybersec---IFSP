FROM node:22-alpine

WORKDIR /app

# Instala apenas dependencias de producao a partir do lockfile
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copia o restante da aplicacao
COPY . .

ENV NODE_ENV=production
# Caminho do banco SQLite (persistido via volume montado em /app/data)
ENV DB_PATH=/app/data/data.db

EXPOSE 3000

CMD ["node", "server.js"]
