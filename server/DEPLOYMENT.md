# Google Cloud Run Deployment Guide

This guide covers deploying the Hackathon E-commerce server to Google Cloud Run.

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Google Cloud CLI** (`gcloud`) installed and configured
   ```bash
   gcloud --version
   ```
3. **Docker** installed locally (for testing)
   ```bash
   docker --version
   ```
4. **Project Setup**
   ```bash
   # Login to Google Cloud
   gcloud auth login
   
   # Create or select a project
   gcloud projects create hackathon-ecom-2025
   gcloud config set project hackathon-ecom-2025
   
   # Enable required APIs
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

## Environment Variables

Before deploying, prepare the following environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | Secret key for JWT tokens | ✅ |
| `CLIENT_URL` | Frontend URL for CORS | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ✅ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ✅ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ✅ |
| `STRIPE_SECRET_KEY` | Stripe secret key | ✅ |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | ✅ |
| `PORT` | Server port (auto-set by Cloud Run) | ⚠️ Auto |
| `NODE_ENV` | Environment (set to `production`) | ⚠️ Auto |

> [!IMPORTANT]
> **Firebase Authentication**: This deployment uses Google Cloud's default service account for Firebase Admin SDK. Ensure your Cloud Run service has the necessary IAM permissions.

## Deployment Methods

### Method 1: Using gcloud CLI (Recommended for First Deployment)

#### Step 1: Build Docker Image Locally (Optional Test)

```bash
cd server

# Build the image
docker build -t hackathon-ecom-server .

# Test locally
docker run -p 8080:8080 \
  -e DATABASE_URL="your-database-url" \
  -e JWT_SECRET="your-jwt-secret" \
  -e CLIENT_URL="http://localhost:5173" \
  hackathon-ecom-server
```

#### Step 2: Deploy to Cloud Run

```bash
# Set your region (choose closest to your users)
export REGION=asia-southeast1

# Deploy using gcloud
gcloud run deploy hackathon-ecom-server \
  --source . \
  --region=$REGION \
  --platform=managed \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --timeout=300 \
  --max-instances=10 \
  --set-env-vars="NODE_ENV=production"
```

#### Step 3: Set Environment Variables

After initial deployment, configure secrets:

```bash
# Update service with environment variables
gcloud run services update hackathon-ecom-server \
  --region=$REGION \
  --set-env-vars="DATABASE_URL=your-database-url,JWT_SECRET=your-jwt-secret,CLIENT_URL=https://your-frontend-url.com,CLOUDINARY_CLOUD_NAME=your-cloud-name,CLOUDINARY_API_KEY=your-api-key,CLOUDINARY_API_SECRET=your-api-secret,STRIPE_SECRET_KEY=your-stripe-key,STRIPE_WEBHOOK_SECRET=your-webhook-secret"
```

> [!TIP]
> For better security, use **Secret Manager** instead of environment variables:
> ```bash
> # Create secrets
> echo -n "your-jwt-secret" | gcloud secrets create jwt-secret --data-file=-
> 
> # Grant Cloud Run access
> gcloud secrets add-iam-policy-binding jwt-secret \
>   --member="serviceAccount:YOUR-PROJECT-NUMBER-compute@developer.gserviceaccount.com" \
>   --role="roles/secretmanager.secretAccessor"
> 
> # Update service to use secret
> gcloud run services update hackathon-ecom-server \
>   --region=$REGION \
>   --update-secrets=JWT_SECRET=jwt-secret:latest
> ```

### Method 2: Using Cloud Build (Automated CI/CD)

#### Step 1: Configure Cloud Build

The `cloudbuild.yaml` file is already configured. Review and update:
- `--region` in the deploy step (default: `asia-southeast1`)
- Memory and CPU settings as needed

#### Step 2: Grant Cloud Build Permissions

```bash
# Get your project number
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")

# Grant Cloud Run Admin role to Cloud Build
gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"

# Grant Service Account User role
gcloud iam service-accounts add-iam-policy-binding \
  ${PROJECT_NUMBER}-compute@developer.gserviceaccount.com \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

#### Step 3: Trigger Build

```bash
# Manual trigger
gcloud builds submit --config=cloudbuild.yaml ..

# Or connect to GitHub for automatic deployments
gcloud builds triggers create github \
  --repo-name=hackathon-ecom \
  --repo-owner=YOUR_GITHUB_USERNAME \
  --branch-pattern="^main$" \
  --build-config=server/cloudbuild.yaml
```

## Database Setup

### Cloud SQL PostgreSQL (Recommended)

```bash
# Create Cloud SQL instance
gcloud sql instances create hackathon-ecom-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=$REGION

# Create database
gcloud sql databases create hackathon_ecom \
  --instance=hackathon-ecom-db

# Create user
gcloud sql users create appuser \
  --instance=hackathon-ecom-db \
  --password=SECURE_PASSWORD

# Connect Cloud Run to Cloud SQL
gcloud run services update hackathon-ecom-server \
  --region=$REGION \
  --add-cloudsql-instances=PROJECT_ID:REGION:hackathon-ecom-db

# Get connection string
# Format: postgresql://appuser:SECURE_PASSWORD@/hackathon_ecom?host=/cloudsql/PROJECT_ID:REGION:hackathon-ecom-db
```

### Run Prisma Migrations

You'll need to run migrations after deployment:

```bash
# Option 1: Run from local machine connected to Cloud SQL
gcloud sql connect hackathon-ecom-db --user=appuser
# Then run: npx prisma migrate deploy

# Option 2: Create a Cloud Build step for migrations
# Add to cloudbuild.yaml before deploy step
```

## Post-Deployment

### Verify Deployment

```bash
# Get service URL
gcloud run services describe hackathon-ecom-server \
  --region=$REGION \
  --format="value(status.url)"

# Test API
curl https://YOUR-SERVICE-URL/api/v1/products
```

### View Logs

```bash
# Stream logs
gcloud run services logs tail hackathon-ecom-server --region=$REGION

# Or via Cloud Console
# https://console.cloud.google.com/run
```

### Update Deployment

```bash
# After making code changes
gcloud run deploy hackathon-ecom-server \
  --source . \
  --region=$REGION
```

## Security Checklist

- [ ] Enable HTTPS (automatic with Cloud Run)
- [ ] Configure CORS with specific CLIENT_URL
- [ ] Use Secret Manager for sensitive data
- [ ] Enable Cloud Armor for DDoS protection
- [ ] Set up Cloud IAM roles appropriately
- [ ] Configure VPC if using Cloud SQL
- [ ] Enable Container Scanning
- [ ] Set up monitoring and alerts

## Cost Optimization

```bash
# Set minimum instances to 0 (cold starts acceptable)
gcloud run services update hackathon-ecom-server \
  --region=$REGION \
  --min-instances=0

# Set maximum instances to control costs
gcloud run services update hackathon-ecom-server \
  --region=$REGION \
  --max-instances=5

# Use lower memory/CPU for development
gcloud run services update hackathon-ecom-server \
  --region=$REGION \
  --memory=256Mi \
  --cpu=1
```

## Troubleshooting

### Container fails to start
- Check logs: `gcloud run services logs read hackathon-ecom-server --region=$REGION`
- Verify environment variables are set correctly
- Ensure DATABASE_URL is accessible from Cloud Run

### Database connection timeout
- Check Cloud SQL instance is running
- Verify Cloud SQL connection is added to Cloud Run service
- Check DATABASE_URL format for Cloud SQL

### Firebase authentication errors
- Verify service account has Firebase Admin permissions
- Check firebaseServiceAccountKey.json is properly configured

### Build fails
- Review Cloud Build logs: `gcloud builds list --limit=5`
- Check Dockerfile syntax
- Verify all dependencies in package.json

## Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)

## Quick Reference

```bash
# Deploy
gcloud run deploy hackathon-ecom-server --source . --region=asia-southeast1

# Update env vars
gcloud run services update hackathon-ecom-server --region=asia-southeast1 --set-env-vars="KEY=value"

# View logs
gcloud run services logs tail hackathon-ecom-server --region=asia-southeast1

# Get URL
gcloud run services describe hackathon-ecom-server --region=asia-southeast1 --format="value(status.url)"

# Delete service
gcloud run services delete hackathon-ecom-server --region=asia-southeast1
```
