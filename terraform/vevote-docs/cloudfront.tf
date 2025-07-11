module "s3_static_cloudfront" {
  source        = "git@github.com:vechain/terraform_infrastructure_modules.git//s3-static-cloudfront-hosting?ref=d6221a6dd80eff03ea1b520efac559a800222792" # v.3.1.5
  env           = local.env.environment
  project       = local.env.project
  domain_name   = local.env.domain_name
  domain_zone   = aws_route53_zone.public.zone_id
  origin_id     = local.env.origin_id
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
  additional_aliases_zones = {
    "vevote.vechain.org"     = aws_route53_zone.public.zone_id,
    "www.vevote.vechain.org" = aws_route53_zone.public.zone_id
  }
  ordered_cache_behavior = {
    "ordered_cache_behavior_1" = {
      path_pattern           = "/legal-documents/*"
      allowed_methods        = ["GET", "HEAD", "OPTIONS"]
      cached_methods         = ["GET", "HEAD", "OPTIONS"]
      target_origin_id       = "legal-test"
      viewer_protocol_policy = "redirect-to-https"
      max_ttl                = 0
      forwarded_values = {
        headers                 = []
        query_string            = false
        query_string_cache_keys = []
        cookies = {
          forward           = "none"
          whitelisted_names = []
        }
      }
    }
  }
  origin = {
    "legal-test" = {
      domain_name = "${module.s3_legal_terms.id}.s3.eu-west-1.amazonaws.com"
      origin_id   = "legal-test"
      referer     = "random"
    }
  }
}


output "domain_validation_records" {
  value = module.s3_static_cloudfront.domain_validation_records
}
