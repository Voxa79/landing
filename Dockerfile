FROM node:18-alpine AS build

# Sécurité: utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S landing -u 1001 -G nodejs

# Copier et installer les dépendances
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --no-audit --no-fund

# Copier le code source et build
COPY --chown=landing:nodejs . .
RUN npm run build

# Stage de production ultra-minimal
FROM nginx:1.25-alpine AS production

# Sécurité: supprimer les packages inutiles
RUN apk del --purge wget curl && \
    rm -rf /var/cache/apk/* /tmp/* /var/tmp/*

# Utilisateur non-root
RUN addgroup -g 1001 -S landing && \
    adduser -S landing -u 1001 -G landing

# Configuration Nginx sécurisée
COPY nginx.conf /etc/nginx/nginx.conf

# Copier les fichiers buildés
COPY --from=build --chown=landing:landing /app/dist /usr/share/nginx/html/
RUN chown -R landing:landing /usr/share/nginx/html

USER landing
EXPOSE 3030
CMD ["nginx", "-g", "daemon off;"]