#!/bin/env bash
npm run generate-key
if [ "$NODE_ENV" = "dev" ]; then
  npm run start-watch
elif [ "$NODE_ENV" = "test" ]; then
  npm run test-watch
else
  npm run start
fi
