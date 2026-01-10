#!/bin/sh

set -ex

# Reset kibana_system password
curl -X POST "$ES_HOST/_security/user/kibana_system/_password" \
  -H "Content-Type: application/json" \
  -u "$ELASTIC_USER:$ELASTIC_PASSWORD" \
  -d '{
    "password": "password"
  }'

echo ""
echo "User setup completed successfully!"



