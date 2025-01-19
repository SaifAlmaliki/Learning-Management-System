# Get current AWS region for Lambda ARN construction
data "aws_region" "current" {}

# Create REST API Gateway
resource "aws_api_gateway_rest_api" "lms_api" {
  name = "lms-api-gw-${var.environment}"

  endpoint_configuration {
    types = ["EDGE"]
  }

  tags = {
    Environment = var.environment
    Project     = "cognitechx academy"
  }
}

# Create proxy resource to catch all paths
resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = aws_api_gateway_rest_api.lms_api.id
  parent_id   = aws_api_gateway_rest_api.lms_api.root_resource_id
  path_part   = "{proxy+}"  # Catch-all path parameter
}

# Create ANY method for proxy resource
resource "aws_api_gateway_method" "proxy" {
  rest_api_id   = aws_api_gateway_rest_api.lms_api.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "ANY"     # Accept any HTTP method
  authorization = "NONE"    # No authorization required
}

# Create Lambda integration for proxy resource
resource "aws_api_gateway_integration" "lambda" {
  rest_api_id = aws_api_gateway_rest_api.lms_api.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.proxy.http_method

  integration_http_method = "POST"  # Lambda requires POST
  type                   = "AWS_PROXY"  # Use Lambda proxy integration
  uri                    = "arn:aws:apigateway:${data.aws_region.current.name}:lambda:path/2015-03-31/functions/${var.lambda_function_arn}/invocations"
}

# Create ANY method for root path
resource "aws_api_gateway_method" "proxy_root" {
  rest_api_id   = aws_api_gateway_rest_api.lms_api.id
  resource_id   = aws_api_gateway_rest_api.lms_api.root_resource_id
  http_method   = "ANY"
  authorization = "NONE"
}

# Create Lambda integration for root path
resource "aws_api_gateway_integration" "lambda_root" {
  rest_api_id = aws_api_gateway_rest_api.lms_api.id
  resource_id = aws_api_gateway_rest_api.lms_api.root_resource_id
  http_method = aws_api_gateway_method.proxy_root.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = "arn:aws:apigateway:${data.aws_region.current.name}:lambda:path/2015-03-31/functions/${var.lambda_function_arn}/invocations"
}

# Create OPTIONS method for proxy resource
resource "aws_api_gateway_method" "proxy_options" {
  rest_api_id   = aws_api_gateway_rest_api.lms_api.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# Create OPTIONS integration for proxy resource
resource "aws_api_gateway_integration" "proxy_options" {
  rest_api_id = aws_api_gateway_rest_api.lms_api.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.proxy_options.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# Create OPTIONS method response for proxy resource
resource "aws_api_gateway_method_response" "proxy_options" {
  rest_api_id = aws_api_gateway_rest_api.lms_api.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.proxy_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# Create OPTIONS integration response for proxy resource
resource "aws_api_gateway_integration_response" "proxy_options" {
  rest_api_id = aws_api_gateway_rest_api.lms_api.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.proxy_options.http_method
  status_code = aws_api_gateway_method_response.proxy_options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS,PATCH,HEAD'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"  # Allow all origins
  }
}

# Create OPTIONS method for root resource
resource "aws_api_gateway_method" "root_options" {
  rest_api_id   = aws_api_gateway_rest_api.lms_api.id
  resource_id   = aws_api_gateway_rest_api.lms_api.root_resource_id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# Create OPTIONS integration for root resource
resource "aws_api_gateway_integration" "root_options" {
  rest_api_id = aws_api_gateway_rest_api.lms_api.id
  resource_id = aws_api_gateway_rest_api.lms_api.root_resource_id
  http_method = aws_api_gateway_method.root_options.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# Create OPTIONS method response for root resource
resource "aws_api_gateway_method_response" "root_options" {
  rest_api_id = aws_api_gateway_rest_api.lms_api.id
  resource_id = aws_api_gateway_rest_api.lms_api.root_resource_id
  http_method = aws_api_gateway_method.root_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# Create OPTIONS integration response for root resource
resource "aws_api_gateway_integration_response" "root_options" {
  rest_api_id = aws_api_gateway_rest_api.lms_api.id
  resource_id = aws_api_gateway_rest_api.lms_api.root_resource_id
  http_method = aws_api_gateway_method.root_options.http_method
  status_code = aws_api_gateway_method_response.root_options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS,PATCH,HEAD'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"  # Allow all origins
  }
}

# Create API Gateway CORS Gateway Response for 4XX errors
resource "aws_api_gateway_gateway_response" "cors_4xx" {
  rest_api_id = aws_api_gateway_rest_api.lms_api.id
  response_type = "DEFAULT_4XX"

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin" = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS,PATCH,HEAD'"
    "gatewayresponse.header.Access-Control-Allow-Credentials" = "'true'"
  }
}

# Create API Gateway CORS Gateway Response for 5XX errors
resource "aws_api_gateway_gateway_response" "cors_5xx" {
  rest_api_id = aws_api_gateway_rest_api.lms_api.id
  response_type = "DEFAULT_5XX"

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin" = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS,PATCH,HEAD'"
    "gatewayresponse.header.Access-Control-Allow-Credentials" = "'true'"
  }
}

# Create IAM role for API Gateway CloudWatch logging
resource "aws_iam_role" "api_gateway_cloudwatch" {
  name = "api-gateway-cloudwatch-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
      }
    ]
  })
}

# Attach CloudWatch logging policy to the role
resource "aws_iam_role_policy" "api_gateway_cloudwatch" {
  name = "api-gateway-cloudwatch-${var.environment}"
  role = aws_iam_role.api_gateway_cloudwatch.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams",
          "logs:PutLogEvents",
          "logs:GetLogEvents",
          "logs:FilterLogEvents"
        ]
        Resource = "*"
      }
    ]
  })
}

# Set up account-level settings for API Gateway
resource "aws_api_gateway_account" "main" {
  cloudwatch_role_arn = aws_iam_role.api_gateway_cloudwatch.arn
}

# Create API deployment
resource "aws_api_gateway_deployment" "api" {
  rest_api_id = aws_api_gateway_rest_api.lms_api.id
  depends_on = [
    aws_api_gateway_integration.lambda,
    aws_api_gateway_integration.lambda_root,
    aws_api_gateway_integration.proxy_options,
    aws_api_gateway_integration.root_options,
    aws_api_gateway_gateway_response.cors_4xx,
    aws_api_gateway_gateway_response.cors_5xx
  ]

  lifecycle {
    create_before_destroy = true
  }
}

# Create API stage
resource "aws_api_gateway_stage" "dev" {
  deployment_id = aws_api_gateway_deployment.api.id
  rest_api_id   = aws_api_gateway_rest_api.lms_api.id
  stage_name    = var.environment
}

# Configure method settings for the API Gateway stage
resource "aws_api_gateway_method_settings" "all" {
  rest_api_id = aws_api_gateway_rest_api.lms_api.id
  stage_name  = aws_api_gateway_stage.dev.stage_name
  method_path = "*/*"

  settings {
    metrics_enabled        = true
    logging_level         = "INFO"
    data_trace_enabled    = true
    throttling_burst_limit = 5000
    throttling_rate_limit  = 10000
  }
}

# Add Lambda permission for API Gateway
resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowAPIGatewayInvoke_${var.environment}"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name
  principal     = "apigateway.amazonaws.com"

  # The /*/* portion grants access from any method on any resource
  # within the specified API Gateway.
  source_arn = "${aws_api_gateway_rest_api.lms_api.execution_arn}/*/*"
}

output "invoke_url" {
  value = aws_api_gateway_stage.dev.invoke_url
}