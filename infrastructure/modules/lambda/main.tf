resource "aws_iam_role" "lambda_role" {
  name = "lms_lambda_role_${var.environment}"

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

# Attach DynamoDB policy
resource "aws_iam_role_policy_attachment" "dynamodb_policy" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

# S3 access policy
resource "aws_iam_role_policy" "s3_policy" {
  name = "lms-lambda-s3-policy-${var.environment}"
  role = aws_iam_role.lambda_role.id

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

# CloudWatch Logs policy
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Load environment variables from .env file
data "local_file" "env" {
  filename = "${path.root}/.env"
}

locals {
  env_vars = { for line in split("\n", data.local_file.env.content) :
    split("=", line)[0] => split("=", line)[1] if length(split("=", line)) == 2
  }
}

# Create ZIP file from the Lambda source code
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.root}/../../../server/dist"
  output_path = "${path.module}/lambda.zip"
}

resource "aws_lambda_function" "lms_lambda" {
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  function_name    = "lms-express-lambda-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30
  memory_size     = 1024

  environment {
    variables = {
      NODE_ENV             = "production"
      S3_BUCKET_NAME       = var.s3_bucket_name
      CLOUDFRONT_DOMAIN    = var.cloudfront_domain
      STRIPE_SECRET_KEY    = var.stripe_secret_key
      CLERK_PUBLISHABLE_KEY = var.clerk_publishable_key
      CLERK_SECRET_KEY     = var.clerk_secret_key
    }
  }
}
