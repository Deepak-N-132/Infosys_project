# ============================================================
# FreshCheck AI - Frontend Production Multi-Stage Dockerfile
# ============================================================

# Stage 1: Build static assets
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build Vite application for production
RUN npm run build

# Stage 2: Serve with NGINX Alpine
FROM nginx:1.27-alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
