#!/usr/bin/env bash
cd  $1
set -e
set -x

# export NODE_ENV="$2"

# Clean the dist directory
rm -rf dist

yarn run build --stats-error-details

# if [ $NODE_ENV == "development" ]; then

#   # this runs webpack-dev-server with hot reloading
#   npm run build-dev
# elif [ $NODE_ENV == "staging" ]; then
#   # this runs webpack-dev-server with hot reloading
#   npm run build-staging
# elif [ $NODE_ENV == "pre-prod" ]; then
#   # this runs webpack-dev-server with hot reloading
#   npm run build-pre-prod
# else
#   # build the app and serve it via nginx
#   npm run build-prod
# fi
