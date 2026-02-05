#!/bin/sh
set -ex

echo "Waiting for Kibana to be ready..."
until curl -sf -u "$ELASTIC_USER:$KIBANA_PASSWORD" "$KIBANA_HOST/api/status" > /dev/null 2>&1; do
  echo "Kibana not ready yet, waiting..."
  sleep 5
done

echo "Kibana is ready!"

# Create data view for GELF logs
echo "Creating data view..."
curl -X POST "$KIBANA_HOST/api/data_views/data_view" \
  -H "Content-Type: application/json" \
  -H "kbn-xsrf: true" \
  -u "$ELASTIC_USER:$KIBANA_PASSWORD" \
  -d '{
    "data_view": {
      "title": "logstash-gelf-*",
      "name": "Backend GELF Logs",
      "timeFieldName": "@timestamp"
    }
  }' || echo "Data view might already exist, continuing..."

# Import dashboard and visualizations
if [ -f /dashboard.ndjson ]; then
  echo "Importing dashboard..."
  curl -X POST "$KIBANA_HOST/api/saved_objects/_import?overwrite=true" \
    -H "kbn-xsrf: true" \
    -u "$ELASTIC_USER:$KIBANA_PASSWORD" \
    --form file=@/dashboard.ndjson
  
  echo "Dashboard imported successfully!"
else
  echo "No dashboard.ndjson found, skipping dashboard import"
fi

echo "Kibana setup completed successfully!"
