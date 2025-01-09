variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
}

variable "domain_name" {
  description = "Main domain name"
  type        = string
}

variable "api_domain_name" {
  description = "Domain name for the API Gateway"
  type        = string
}

variable "api_gateway_domain_name" {
  description = "API Gateway domain name for the alias record"
  type        = string
}

variable "api_gateway_zone_id" {
  description = "API Gateway hosted zone ID"
  type        = string
}
