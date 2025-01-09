# CognitechX Academy Infrastructure

This directory contains the Terraform infrastructure code for the CognitechX Academy learning management system. The infrastructure is designed to be scalable, secure, and cost-effective using various AWS services.

## Architecture Overview

![Infrastructure Architecture](./docs/architecture.png)

The infrastructure consists of the following main components:

### 1. API Gateway (modules/api_gateway)
- Serves as the main entry point for all API requests
- Configured with a REST API setup
- Endpoint: `https://bo77ck5tr4.execute-api.eu-central-1.amazonaws.com/dev`
- Proxies all requests to the Lambda function

### 2. Lambda Function (modules/lambda)
- Runs the Node.js Express backend application
- Handles all API requests from API Gateway
- Environment variables include:
  - S3 bucket name for file storage
  - CloudFront domain for frontend
  - Stripe and Clerk API keys
- Memory: 1024MB
- Timeout: 30 seconds

### 3. S3 Bucket (modules/s3)
- Stores all user-uploaded files
- Configured with:
  - Versioning enabled
  - CORS rules for frontend access
  - Public read access for files
  - Bucket policy allowing necessary operations

### 4. CloudFront Distribution (modules/cloudfront)
- CDN for serving frontend assets
- Connected to the S3 bucket
- Provides HTTPS access to the frontend

### 5. DynamoDB (modules/dynamodb)
- NoSQL database for storing application data
- Tables are created and managed through the Lambda function

## Module Dependencies

```
API Gateway
    └── Lambda Function
        ├── S3 Bucket
        ├── CloudFront
        └── DynamoDB
```

## Environment Configuration

The infrastructure supports multiple environments (dev, prod) with environment-specific configurations in:
- `environments/dev/`
- `environments/prod/` (when needed)

### Key Files
- `main.tf`: Main configuration file that imports and configures all modules
- `variables.tf`: Variable definitions
- `terraform.tfvars`: Environment-specific values (gitignored for security)
- `outputs.tf`: Outputs important information like endpoints and resource names

## Security Features

1. **IAM Roles and Policies**
   - Lambda function has specific IAM role with:
     - DynamoDB access
     - S3 bucket access
     - CloudWatch logs access

2. **S3 Security**
   - Versioning enabled
   - Public access configured only for necessary operations
   - CORS rules for frontend access

## Deployment Instructions

1. Initialize Terraform:
   ```bash
   terraform init
   ```

2. Create terraform.tfvars with required variables:
   ```hcl
   environment = "dev"
   aws_region = "eu-central-1"
   stripe_secret_key = "your-stripe-key"
   clerk_publishable_key = "your-clerk-pub-key"
   clerk_secret_key = "your-clerk-secret-key"
   ```

3. Deploy the infrastructure:
   ```bash
   terraform plan
   terraform apply
   ```

4. Get the deployment outputs:
   ```bash
   terraform output
   ```

## Important URLs and Endpoints

- API Gateway: `https://bo77ck5tr4.execute-api.eu-central-1.amazonaws.com/dev`
- CloudFront Distribution: (Check `terraform output cloudfront_domain`)
- S3 Bucket: (Check `terraform output s3_bucket_domain`)

## Frontend Integration

Update the frontend environment variables in `client/.env`:
```env
NEXT_PUBLIC_API_BASE_URL="https://bo77ck5tr4.execute-api.eu-central-1.amazonaws.com/dev"
```

## Backend Integration

Update the backend environment variables in `server/.env`:
```env
NODE_ENV="production"
S3_BUCKET_NAME="[from terraform output s3_bucket_name]"
CLOUDFRONT_DOMAIN="[from terraform output cloudfront_domain]"
