#!/bin/bash
#OWNER="ashish757"
#SERVICES=("auth-app" "user-app" "friend-app" "user-movie" "notification-app" "movie-app")
#
#for SERVICE in "${SERVICES[@]}"
#do
#  echo "Building and pushing $SERVICE..."
#  docker build --platform linux/amd64 --build-arg APP_NAME=$SERVICE -t ghcr.io/$OWNER/$SERVICE:latest .
#  docker push ghcr.io/$OWNER/$SERVICE:latest
#done

# Replace with your actual Redis FQDN from Step 1 or Step 2
#
#REDIS_HOST_VALUE="https://trackd-redis.internal.thankfulpond-a16d58ec.centralindia.azurecontainerapps.io"
#
#SERVICES=("api-gateway" "auth-app" "user-app" "friend-app" "user-movie" "notification-app" "movie-app")
#
#for SERVICE in "${SERVICES[@]}"
#do
#  echo "Updating $SERVICE with Redis config..."
#  az containerapp update \
#    --name $SERVICE \
#    --resource-group trackd-ms \
#    --set-env-vars \
#      REDIS_HOST=$REDIS_HOST_VALUE \
#      REDIS_PORT=6379
#done