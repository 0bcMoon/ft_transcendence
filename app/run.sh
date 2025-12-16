#!/bin/sh

set -ex
# Start the application
cd /app/frontend

npm install

npm run build

cd /app/backend

npm install

exec  npm run dev
