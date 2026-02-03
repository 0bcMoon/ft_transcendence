# #!/bin/sh
# set -ex

# curl -X POST "$ELASTIC_HOST/_security/user/kibana_system/_password" \
#     -H "Content-Type: application/json" \
#     -u "$ELASTIC_USER:$ELASTIC_PASSWORD" \
#     -d "{ \"password\": \"$KIBANA_PASSWORD\" }"

# echo "User setup completed successfully!"


#!/bin/sh
set -e

ES_URL="${ES_URL:-http://elasticsearch:9200}"
ELASTIC_USER="${ELASTIC_USER:-elastic}"
ELASTIC_PASSWORD="${ELASTIC_PASSWORD:-password}"

# example: set kibana_system password
curl -sS -X POST "$ES_URL/_security/user/kibana_system/_password" \
  -H 'Content-Type: application/json' \
  -u "$ELASTIC_USER:$ELASTIC_PASSWORD" \
  -d "{\"password\":\"$KIBANA_SYSTEM_PASSWORD\"}"
