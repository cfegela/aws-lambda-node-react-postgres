# Data source for existing hosted zone (only if custom domain is specified)
data "aws_route53_zone" "main" {
  count   = var.route53_zone_id != "" ? 1 : 0
  zone_id = var.route53_zone_id
}

# Route53 A record for CloudFront distribution
resource "aws_route53_record" "frontend" {
  count   = var.route53_zone_id != "" && var.frontend_domain != "" ? 1 : 0
  zone_id = data.aws_route53_zone.main[0].zone_id
  name    = var.frontend_domain
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.frontend.domain_name
    zone_id                = aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
}

# Route53 AAAA record for CloudFront distribution (IPv6)
resource "aws_route53_record" "frontend_ipv6" {
  count   = var.route53_zone_id != "" && var.frontend_domain != "" ? 1 : 0
  zone_id = data.aws_route53_zone.main[0].zone_id
  name    = var.frontend_domain
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.frontend.domain_name
    zone_id                = aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
}
