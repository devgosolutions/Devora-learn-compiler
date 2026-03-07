FROM golang:1.21-alpine

RUN adduser -D -u 1000 compiler
WORKDIR /code

COPY run.sh /run.sh
RUN chmod +x /run.sh

USER compiler

ENTRYPOINT ["/bin/sh", "/run.sh"]
