FROM nginx:alpine


RUN apk add --no-cache openssl


COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./public /usr/share/nginx/html
COPY ./tools/ssl_cert_generator.sh /usr/local/bin/ssl_cert_generator.sh
RUN chmod +x /usr/local/bin/ssl_cert_generator.sh


RUN mkdir -p /etc/nginx/certs


CMD ["/bin/sh", "-lc", "ssl_cert_generator.sh && nginx -g 'daemon off;'"]
