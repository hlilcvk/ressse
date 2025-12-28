FROM node:18-alpine

ARG CACHEBUST=1
# Nginx yükle
RUN apk add --no-cache nginx postgresql-client supervisor

WORKDIR /app

# Backend kopyala ve kur
COPY backend/package.json ./backend/
WORKDIR /app/backend
RUN npm install --production
COPY backend/ ./

# Frontend kopyala
WORKDIR /app
COPY frontend/ /usr/share/nginx/html/
COPY frontend/nginx.conf /etc/nginx/http.d/default.conf

# Supervisor config
COPY supervisord.conf /etc/supervisord.conf

# PostgreSQL init script
COPY init-db.sh /init-db.sh
RUN chmod +x /init-db.sh

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
