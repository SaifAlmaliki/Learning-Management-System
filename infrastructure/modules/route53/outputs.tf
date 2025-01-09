output "hosted_zone_id" {
  description = "ID of the hosted zone"
  value       = data.aws_route53_zone.main.zone_id
}

output "record_name" {
  description = "The created DNS record name"
  value       = aws_route53_record.api.name
}
