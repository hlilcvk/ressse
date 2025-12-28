FROM node:18-alpine

RUN apk add --no-cache nginx postgresql-client supervisor bash

WORKDIR /app

# Backend - cache'i kırmak için önce sil
RUN rm -rf ./backend || true

# Backend kopyala
COPY backend/ ./backend/
WORKDIR /app/backend
RUN npm install --production

# Frontend kopyala
WORKDIR /app
COPY frontend/ /usr/share/nginx/html/
COPY frontend/nginx.conf /etc/nginx/http.d/default.conf

COPY supervisord.conf /etc/supervisord.conf
COPY startup.sh /startup.sh
RUN chmod +x /startup.sh

EXPOSE 80
CMD ["/startup.sh"]
