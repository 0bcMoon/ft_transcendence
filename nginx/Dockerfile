FROM alpine:3.21

RUN apk update && apk add nginx 


RUN mkdir -p /var/www/html;

COPY nginx.conf /etc/nginx/nginx.conf

CMD ["nginx"]
