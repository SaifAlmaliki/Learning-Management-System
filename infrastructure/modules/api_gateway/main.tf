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

# Create API deployment
resource "aws_api_gateway_deployment" "api" {
  rest_api_id = aws_api_gateway_rest_api.lms_api.id
  depends_on = [
    aws_api_gateway_integration.lambda,
    aws_api_gateway_integration.lambda_root,
  ]

  lifecycle {
    create_before_destroy = true  # Prevent downtime during updates
  }
}

# Create API stage
resource "aws_api_gateway_stage" "dev" {
  deployment_id = aws_api_gateway_deployment.api.id
  rest_api_id   = aws_api_gateway_rest_api.lms_api.id
  stage_name    = var.environment

  description = "Development Stage for the LMS Backend"
}

# Grant API Gateway permission to invoke Lambda
resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.lms_api.execution_arn}/*/*"  # Allow all methods and paths
}

output "invoke_url" {
  value = aws_api_gateway_stage.dev.invoke_url
}
