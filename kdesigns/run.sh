#!/usr/bin/env bash
set -e
set -x

export NODE_ENV="${NODE_ENV:-dev}"

if [ $NODE_ENV == "dev" ]; then

  # this runs webpack-dev-server with hot reloading
  npm start
else
  # build the app and serve it via nginx
  npm run build
fi
