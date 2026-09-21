FROM node:24-bookworm-slim
WORKDIR /app
RUN npm install -g pnpm@10.4.1
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
ENV NODE_ENV=production
EXPOSE 3000
USER node
CMD ["pnpm", "start"]
