# Configure Terraform and required providers
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  # Configure backend to store state in S3
  backend "s3" {
    bucket         = "cognitechx-terraform-state"
    key            = "dev/terraform.tfstate"
    region         = "eu-central-1"
    encrypt        = true
  }
}

# Configure AWS Provider with region and default tags
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "cognitechx academy"
      Environment = var.environment
    }
  }
}

# Import modules
# S3 Module: Creates and configures the S3 bucket for file storage
module "s3" {
  source      = "../../modules/s3"
  environment = var.environment
}

# CloudFront Module: Creates CDN distribution for the frontend
module "cloudfront" {
  source = "../../modules/cloudfront"
  environment = var.environment
  s3_bucket_domain = module.s3.bucket_domain_name
  s3_bucket_id = module.s3.bucket_id
}

# Lambda Module: Creates the Lambda function and its execution role
module "lambda" {
  source      = "../../modules/lambda"
  environment = var.environment
  s3_bucket_name = module.s3.bucket_name
  cloudfront_domain = module.cloudfront.distribution_domain_name
  stripe_secret_key = var.stripe_secret_key
  clerk_publishable_key = var.clerk_publishable_key
  clerk_secret_key = var.clerk_secret_key
}

# DynamoDB Module: Creates DynamoDB tables for the application
module "dynamodb" {
  source      = "../../modules/dynamodb"
  environment = var.environment
}

# Grant Lambda function access to DynamoDB
resource "aws_iam_role_policy_attachment" "lambda_dynamodb" {
  role       = module.lambda.role_name
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

# API Gateway Module: Creates the API Gateway REST API
module "api_gateway" {
  source = "../../modules/api_gateway"
  environment = var.environment
  lambda_function_name = module.lambda.function_name
  lambda_function_arn = module.lambda.function_arn
}
