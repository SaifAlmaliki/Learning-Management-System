# CognitechX Academy Infrastructure

This directory contains the Terraform infrastructure code for the CognitechX Academy Learning Management System. The infrastructure is designed to be scalable, secure, and cost-effective.

## Architecture Overview

The infrastructure is built on AWS and consists of the following main components:

### Compute and API Layer
- **AWS Lambda**: Serverless compute service running the Node.js backend
- **API Gateway**: RESTful API interface for the frontend to communicate with Lambda functions
- **IAM Roles**: Managed permissions for Lambda to access other AWS services

### Database Layer
1. **Course Table (DynamoDB)**
   - Primary Key: `courseId`
   - Stores course information including:
     - Title, description, category
     - Teacher information
     - Price and status
     - Sections and chapters structure

2. **User Course Progress Table (DynamoDB)**
   - Composite Key: `userId` (hash) + `courseId` (range)
   - Global Secondary Index: `EnrollmentDateIndex`
   - Tracks:
     - User's progress in each course
     - Completion status of chapters
     - Enrollment dates
     - Quiz scores and achievements

3. **Transaction Table (DynamoDB)**
   - Composite Key: `userId` (hash) + `transactionId` (range)
   - Global Secondary Index for `courseId`
   - Records:
     - Course purchase transactions
     - Payment information
     - Purchase dates
     - Transaction status

### Storage and Content Delivery
- **S3 Bucket**:
  - Stores course videos and other static content
  - Configured with CORS for frontend access
  - Public access controlled via bucket policy
  - Versioning configured for content management

- **CloudFront Distribution**:
  - Global content delivery network
  - Caches and distributes course videos
  - HTTPS enabled with custom SSL certificate
  - Optimized for video streaming
  - Edge locations for reduced latency
  - Custom domain support

### Security
- **IAM Roles and Policies**: Least privilege access for all components
- **API Gateway Authorization**: JWT-based authentication
- **CloudFront OAI**: Secure access to S3 content
- **CORS Configuration**: Controlled cross-origin access
- **SSL/TLS**: Encrypted data in transit

### Monitoring and Logging
- **CloudWatch Logs**: Application and access logging
- **CloudWatch Metrics**: Performance monitoring
- **X-Ray**: Distributed tracing (optional)

## Environment Management

The infrastructure supports multiple environments:
- Development (`dev`)
- Production (`prod`)

Each environment has its own:
- State file in S3
- DynamoDB tables
- Lambda functions
- API Gateway endpoints
- CloudFront distribution

## Infrastructure Modules

The infrastructure is organized into the following modules:

- `api_gateway/`: API Gateway configuration
- `cloudfront/`: CDN setup for video delivery
- `dynamodb/`: Database tables and indexes
- `lambda/`: Serverless function configuration
- `s3/`: Storage bucket setup
- `route53/`: DNS configuration (if applicable)

## Getting Started

1. Install required tools:
   - Terraform (version 1.0 or later)
   - AWS CLI configured with appropriate credentials

2. Initialize Terraform:
   ```bash
   terraform init
   ```

3. Plan the infrastructure:
   ```bash
   terraform plan
   ```

4. Apply infrastructure:
   ```bash
   terraform apply
   ```

## Important Notes

- The S3 bucket names are globally unique and automatically generated based on account ID and environment
- CloudFront distributions may take up to 30 minutes to deploy
- DynamoDB tables are provisioned with minimal capacity by default
- Lambda functions are configured with environment-specific variables

## Cleanup

To destroy the infrastructure:
```bash
terraform destroy
```

**Note**: This will remove all resources including data in DynamoDB tables and objects in S3 buckets.
