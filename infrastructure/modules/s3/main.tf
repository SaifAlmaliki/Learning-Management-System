resource "aws_s3_bucket" "lms_bucket" {
  bucket = "lms-s3-${data.aws_caller_identity.current.account_id}-${var.environment}"

  tags = {
    Environment = var.environment
  }
}

data "aws_caller_identity" "current" {}

resource "aws_s3_bucket_versioning" "lms_bucket" {
  bucket = aws_s3_bucket.lms_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_cors_configuration" "lms_bucket" {
  bucket = aws_s3_bucket.lms_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_public_access_block" "lms_bucket" {
  bucket = aws_s3_bucket.lms_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

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
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.lms_bucket.arn}/*"
      }
    ]
  })
}

resource "aws_s3_bucket_server_side_encryption_configuration" "lms_bucket" {
  bucket = aws_s3_bucket.lms_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
