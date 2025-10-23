resource "aws_route53_zone" "public" {
  name = local.env.public_zone_name
  tags = {
    Name        = lower("${local.env.public_zone_name}")
    Environment = local.env.environment
    Project     = local.env.project
    Terraform   = "true"
  }
}

