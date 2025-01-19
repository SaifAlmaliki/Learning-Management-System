# Create IAM role for Lambda execution
resource "aws_iam_role" "lambda_role" {
  name = "lms_lambda_role_${var.environment}"

  # Trust policy allowing Lambda service to assume this role
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Attach DynamoDB full access policy to Lambda role
resource "aws_iam_role_policy_attachment" "dynamodb_policy" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

# Create S3 access policy for Lambda
resource "aws_iam_role_policy" "s3_policy" {
  name = "lms-lambda-s3-policy-${var.environment}"
  role = aws_iam_role.lambda_role.id

  # Policy allowing S3 operations on the LMS bucket
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket",
          "s3:GetObjectTagging",
          "s3:PutObjectTagging"
        ]
        Resource = [
          "arn:aws:s3:::${var.s3_bucket_name}",
          "arn:aws:s3:::${var.s3_bucket_name}/*"
        ]
      }
    ]
  })
}

# Attach CloudWatch Logs policy for Lambda logging
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Create ZIP archive from Lambda source code
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.root}/../../../server/dist"
  output_path = "${path.module}/lambda.zip"
}

# Get current AWS region
data "aws_region" "current" {}

# Create Lambda function
resource "aws_lambda_function" "lms_lambda" {
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  function_name    = "lms-express-lambda-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30
  memory_size     = 1024

  # Environment variables for the Lambda function
  environment {
    variables = {
      NODE_ENV             = "production"
      REGION              = data.aws_region.current.name
      S3_BUCKET_NAME       = var.s3_bucket_name
      CLOUDFRONT_DOMAIN    = var.cloudfront_domain
      STRIPE_SECRET_KEY    = var.stripe_secret_key
      CLERK_PUBLISHABLE_KEY = var.clerk_publishable_key
      CLERK_SECRET_KEY     = var.clerk_secret_key
    }
  }
}
