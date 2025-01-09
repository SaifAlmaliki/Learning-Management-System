data "aws_route53_zone" "main" {
  name = var.domain_name
}

resource "aws_route53_record" "api" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.api_domain_name
  type    = "A"

  alias {
    name                   = var.api_gateway_domain_name
    zone_id               = var.api_gateway_zone_id
    evaluate_target_health = true
  }
}
