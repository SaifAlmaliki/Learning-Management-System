locals {
  s3_origin_id = "S3-${var.s3_bucket_id}"
}

# Create CloudFront origin access identity for S3 access
resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "OAI for ${var.environment} environment"
}

# Create CloudFront distribution
resource "aws_cloudfront_distribution" "s3_distribution" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"  # Use only North America and Europe edge locations
  http_version        = "http2"

  # Origin configuration for S3
  origin {
    domain_name = var.s3_bucket_domain
    origin_id   = local.s3_origin_id

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  # Default cache behavior
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.s3_origin_id

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"  # Force HTTPS
    min_ttl                = 0
    default_ttl            = 3600  # 1 hour
    max_ttl                = 86400 # 24 hours
    compress               = true
  }

  # Viewer restrictions
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # SSL certificate configuration
  viewer_certificate {
    cloudfront_default_certificate = true  # Use default CloudFront certificate
  }

  tags = {
    Environment = var.environment
    Project     = "cognitechx academy"
  }
}

# Update S3 bucket policy to allow CloudFront access
data "aws_iam_policy_document" "s3_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["arn:aws:s3:::${var.s3_bucket_id}/*"]

    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.oai.iam_arn]
    }
  }
}
