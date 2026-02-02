#!/bin/sh
set -ex

curl -X POST "$ELASTIC_HOST/_security/user/kibana_system/_password" \
    -H "Content-Type: application/json" \
    -u "$ELASTIC_USER:$ELASTIC_PASSWORD" \
    -d "{ \"password\": \"$KIBANA_PASSWORD\" }"

echo "User setup completed successfully!"
