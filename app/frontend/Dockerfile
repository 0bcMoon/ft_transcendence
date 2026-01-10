# Stage 1: Build the React application
FROM node:24 AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .
# Accept build arguments

ARG VITE_API_URL
ARG VITE_WS_URL

# Set them as environment variables for the build
ENV VITE_API_URL=${VITE_API_URL}

ENV VITE_WS_URL=${VITE_WS_URL}

RUN npm run build


FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
