resource "aws_route53_zone" "public" {
  name = local.env.public_zone_name
  tags = {
    Name        = lower("${local.env.public_zone_name}")
    Environment = local.env.environment
    Project     = local.env.project
    Terraform   = "true"
  }
}

resource "aws_route53_record" "vercel_domain" {
  zone_id = aws_route53_zone.public.zone_id
  name    = local.env.vercel_domain_record_name
  type    = "A"
  ttl     = 60
  records = [local.env.vercel_domain_ip]
}

resource "aws_route53_record" "vercel_domain_verify" {
  zone_id = aws_route53_zone.public.zone_id
  name    = local.env.vercel_domain_name
  type    = "TXT"
  ttl     = 60
  records = [local.env.vercel_domain_verify_record]
}