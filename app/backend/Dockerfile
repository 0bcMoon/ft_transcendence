FROM node:24-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Stage 2: Runtime
FROM node:24-alpine

WORKDIR /app

# Only copy production dependencies to keep the image small
COPY package*.json ./

WORKDIR /app

RUN npm install --omit=dev

# Copy the compiled JS from the builder stage
COPY --from=builder /app/dist ./

# copy db schema
COPY --from=builder /app/db/schema.sql /app/db/schema.sql

CMD ["node", "index.js"]
