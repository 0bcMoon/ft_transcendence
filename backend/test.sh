#!/bin/sh

set -ex

DB_PATH=/tmp/test.db npm run test:migrate > /dev/null

jest $1 --verbose


