# =========================================================
# 1) Build: compila o React com Vite usando PNPM
# =========================================================
FROM node:20-alpine AS build

# Habilita o Corepack e ativa a mesma versão do pnpm do seu projeto
# (se preferir, troque por: RUN npm i -g pnpm@10)
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

WORKDIR /app

# Copia manifestos primeiro para cache eficiente
COPY pnpm-lock.yaml ./
COPY package.json ./

# Instala dependências (sem modificar lockfile)
RUN pnpm install --frozen-lockfile

# Copia o restante do código do frontend
# (Como este Dockerfile está dentro de /frontend/ong-frontend, o contexto já é a pasta correta)
COPY . .

# Se quiser injetar VITE_API_URL no build pelo painel, use ARG + ENV
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Compila o projeto (gera /app/dist)
RUN pnpm build


# =========================================================
# 2) Runtime: servidor Nginx estático, leve e rápido
# =========================================================
FROM nginx:alpine

# Substitui a config padrão pelo nosso SPA-friendly
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os artefatos compilados do estágio anterior
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
