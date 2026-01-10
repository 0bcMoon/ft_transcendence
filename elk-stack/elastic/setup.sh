#!/bin/bash

# Create the users directory if it doesn't exist
mkdir -p /usr/share/elasticsearch/config

# Create users using elasticsearch-users command
/usr/share/elasticsearch/bin/elasticsearch-users useradd myuser -p mypassword -r superuser

/usr/share/elasticsearch/bin/elasticsearch-users useradd kibana_user -p kibana123 -r kibana_admin

# Start Elasticsearch with the original entrypoint
exec /usr/local/bin/docker-entrypoint.sh
