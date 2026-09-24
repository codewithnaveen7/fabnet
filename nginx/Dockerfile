FROM nginx:1.27-alpine

RUN apk add --no-cache gettext

RUN mkdir -p /var/www/public /var/www/certbot
COPY templates/ /etc/nginx/templates/
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

COPY public/ /var/www/public/

EXPOSE 80 443

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
