#!/bin/env bash
npm run generate-key
if [ "$NODE_ENV" = "dev" ]; then
  npm run dev
else
  npm run start
fi
