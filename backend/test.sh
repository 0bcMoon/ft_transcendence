#!/bin/sh

set -ex

DB_PATH=/tmp/test.db npm run migrate > /dev/null

DB_PATH=/tmp/test.db NODE_ENV=test jest $1.test.ts --setupFiles dotenv/config


