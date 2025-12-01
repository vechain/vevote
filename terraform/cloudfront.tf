module "s3_static_cloudfront" {
  source        = "git@github.com:vechain/terraform_infrastructure_modules.git//s3-static-cloudfront-hosting?ref=a842a46292c4a2b41b14c1ecc65a35aa3c2f38a1" # v.3.1.23
  env           = local.env.environment
  project       = local.env.project
  domain_name   = local.env.public_zone_name
  domain_zone   = aws_route53_zone.public.zone_id
  origin_id     = local.env.public_zone_name
  bucket_prefix = local.env.project
  block_public  = false
  referer       = "random"
  cors_rules = [{
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD", "POST", "PUT", "DELETE"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }]
}

module "preview_environments" {
  source        = "git@github.com:vechain/terraform_infrastructure_modules.git//s3-static-cloudfront-hosting?ref=a842a46292c4a2b41b14c1ecc65a35aa3c2f38a1" # v.3.1.23
  env           = local.env.environment
  project       = local.env.preview_environment_bucket_name
  domain_name   = local.env.preview_environment_domain_name
  domain_zone   = aws_route53_zone.public.zone_id
  origin_id     = local.env.preview_environment_domain_name
  bucket_prefix = local.env.preview_environment_bucket_name
  block_public  = false
  referer       = "random"
  cors_rules = [{
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD", "POST", "PUT", "DELETE"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }]
}
