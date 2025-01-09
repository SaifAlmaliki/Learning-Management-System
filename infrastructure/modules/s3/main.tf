# Create S3 bucket with environment-specific name
resource "aws_s3_bucket" "lms_bucket" {
  bucket        = "lms-s3-${data.aws_caller_identity.current.account_id}-${var.environment}"
  force_destroy = true  # Allow deletion of non-empty bucket

  tags = {
    Environment = var.environment
  }
}

# Get current AWS account ID for bucket naming
data "aws_caller_identity" "current" {}

# Disable versioning on the bucket
resource "aws_s3_bucket_versioning" "lms_bucket" {
  bucket = aws_s3_bucket.lms_bucket.id
  versioning_configuration {
    status = "Suspended"  # Disable versioning
  }
}

# Configure CORS rules for frontend access
resource "aws_s3_bucket_cors_configuration" "lms_bucket" {
  bucket = aws_s3_bucket.lms_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE"]
    allowed_origins = ["*"]  # In production, restrict to specific domains
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# Configure public access settings
resource "aws_s3_bucket_public_access_block" "lms_bucket" {
  bucket = aws_s3_bucket.lms_bucket.id

  block_public_acls       = false  # Allow public ACLs
  block_public_policy     = false  # Allow public bucket policies
  ignore_public_acls      = false  # Don't ignore public ACLs
  restrict_public_buckets = false  # Don't restrict public access
}

# Add bucket policy for public read access
resource "aws_s3_bucket_policy" "lms_bucket" {
  depends_on = [aws_s3_bucket_public_access_block.lms_bucket]
  bucket = aws_s3_bucket.lms_bucket.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"  # Allow public read access
        Resource  = "${aws_s3_bucket.lms_bucket.arn}/*"
      }
    ]
  })
}
