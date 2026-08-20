#!/bin/sh
# Deploy FastAPI to Cloud Run in the GCP project you already have.
# Usage:
#   export GCP_PROJECT=your-project-id
#   export DATABASE_URL='postgresql://...neon.tech/neondb?sslmode=require'
#   ./infra/cloud-run.sh
set -eu
PROJECT="${GCP_PROJECT:?set GCP_PROJECT}"
REGION="${GCP_REGION:-europe-west1}"
IMAGE="gcr.io/${PROJECT}/gesht-api"
ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"

gcloud config set project "$PROJECT"
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com

gcloud builds submit "$ROOT" --tag "$IMAGE"

gcloud run deploy gesht-api \
  --image "$IMAGE" \
  --region "$REGION" \
  --allow-unauthenticated \
  --memory 512Mi \
  --set-env-vars "ALLOWED_ORIGINS=https://gesht-tau.vercel.app,https://gesht.vercel.app" \
  --set-env-vars "DATABASE_URL=${DATABASE_URL}"

gcloud run services describe gesht-api --region "$REGION" --format='value(status.url)'
