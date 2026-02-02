FROM node:24-alpine

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

RUN mkdir -p /metrics 

# WORKDIR /tmp

# USER root

# RUN apk update && \
#     apk add --no-cache wget ca-certificates && \
#     rm -rf /var/lib/apt/lists/*

# RUN wget https://github.com/prometheus/node_exporter/releases/download/v1.10.2/node_exporter-1.10.2.linux-amd64.tar.gz && \
#     tar xvf node_exporter-1.10.2.linux-amd64.tar.gz && \
#     cp node_exporter-1.10.2.linux-amd64/node_exporter /usr/local/bin/

WORKDIR /app

# CMD sh -c "npm run dev & /usr/local/bin/node_exporter"

CMD ["npm", "run", "dev"]

# CMD ["/usr/local/bin/node_exporter"]


