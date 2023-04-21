#!/bin/bash

if [ "$1" = "serve" ]; then
  npm start
elif [ "$1" = "build" ]; then
  npx webpack --mode production
else
  echo "Invalid argument. Usage: ./build.sh [serve|build]"
  exit 1
fi
