#!/bin/bash

# Deploy to Cloud Run with all required environment variables
# Make sure you have set these values in your .env file first

# Load environment variables from .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Deploy to Cloud Run
gcloud run deploy hackathon-ecom-server \
  --source . \
  --region=asia-southeast1 \
  --platform=managed \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --timeout=300 \
  --max-instances=10 \
  --set-env-vars="NODE_ENV=production,\
DATABASE_URL=${DATABASE_URL},\
JWT_SECRET=${JWT_SECRET},\
CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME},\
CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY},\
CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET},\
CLIENT_URL=${CLIENT_URL},\
ZALO_APP_ID=${ZALO_APP_ID},\
ZALO_KEY1=${ZALO_KEY1},\
ZALO_KEY2=${ZALO_KEY2},\
ZALO_ENDPOINT=${ZALO_ENDPOINT}"

echo "Deployment completed!"
