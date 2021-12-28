#!/bin/bash

echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"

COMMON_CHANGES=$(git diff HEAD^ HEAD --quiet ./nina-common/)
RADIO_CHANGES=$(git diff HEAD^ HEAD --quiet ./nina-radio/)

if [[ $COMMON_CHANGES || $RADIO_CHANGES  ]] ; then
  # Proceed with the build
    echo "✅ - Build can proceed"
  exit 1;

else
  # Don't build
  echo "🛑 - Build cancelled"
  exit 0;
fi
