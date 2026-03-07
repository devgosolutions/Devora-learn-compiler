FROM python:3.11-slim

RUN useradd -m -u 1000 -s /bin/bash compiler
WORKDIR /code

COPY run.sh /run.sh
RUN chmod +x /run.sh

USER compiler

ENTRYPOINT ["/bin/sh", "/run.sh"]
