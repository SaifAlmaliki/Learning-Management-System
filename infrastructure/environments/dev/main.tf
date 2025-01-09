terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket         = "cognitechx-terraform-state"
    key            = "dev/terraform.tfstate"
    region         = "eu-central-1"
    encrypt        = true
  }
}

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
module "s3" {
  source = "../../modules/s3"
  environment = var.environment
}

module "cloudfront" {
  source = "../../modules/cloudfront"
  environment = var.environment
  s3_bucket_domain = module.s3.bucket_domain_name
  s3_bucket_id = module.s3.bucket_id
}

module "lambda" {
  source = "../../modules/lambda"
  environment = var.environment
  s3_bucket_name = module.s3.bucket_name
  cloudfront_domain = module.cloudfront.distribution_domain_name
  stripe_secret_key = var.stripe_secret_key
  clerk_publishable_key = var.clerk_publishable_key
  clerk_secret_key = var.clerk_secret_key
}

module "dynamodb" {
  source      = "../../modules/dynamodb"
  environment = var.environment
}

# Update Lambda IAM role to access DynamoDB tables
resource "aws_iam_role_policy_attachment" "lambda_dynamodb" {
  role       = module.lambda.role_name
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

module "api_gateway" {
  source = "../../modules/api_gateway"
  environment = var.environment
  lambda_function_name = module.lambda.function_name
  lambda_function_arn = module.lambda.function_arn
}
