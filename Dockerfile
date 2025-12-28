FROM node:18-alpine

# Build arg - cache buster
ARG CACHEBUST=1

RUN apk add --no-cache nginx postgresql-client supervisor bash

WORKDIR /app

# Backend kopyala
COPY backend/ ./backend/
WORKDIR /app/backend
RUN npm install --production

# Frontend kopyala
WORKDIR /app
COPY frontend/ /usr/share/nginx/html/

# Nginx config
COPY nginx.conf /etc/nginx/http.d/default.conf

# Supervisor config
COPY supervisord.conf /etc/supervisord.conf

# Startup script
COPY startup.sh /startup.sh
RUN chmod +x /startup.sh

EXPOSE 80

CMD ["/startup.sh"]
