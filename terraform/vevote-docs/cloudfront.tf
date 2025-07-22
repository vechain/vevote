module "s3_static_cloudfront" {
  source        = "git@github.com:vechain/terraform_infrastructure_modules.git//s3-static-cloudfront-hosting?ref=d6221a6dd80eff03ea1b520efac559a800222792"
  env           = local.env.environment
  project       = local.env.project
  domain_name   = local.env.domain_name
  domain_zone   = aws_route53_zone.public.zone_id
  origin_id     = "vevote-1755724031.ap-east-1.elb.amazonaws.com"
  bucket_prefix = local.env.project
  block_public  = false
  referer       = ""
  compress      = false
  default_root_object = null
  query_string       = false
  create_new_bucket      = false
  existing_bucket_name   = module.s3_legal_terms.id

  ordered_cache_behavior = {
    "cookies" = {
      path_pattern           = "/cookies"
      allowed_methods        = ["GET", "HEAD"]
      cached_methods         = ["GET", "HEAD"]
      target_origin_id       = "${module.s3_legal_terms.id}.s3-website-eu-west-1.amazonaws.com"
      viewer_protocol_policy = "redirect-to-https"
      max_ttl                = 0
      compress              = true
      cache_policy_id       = data.aws_cloudfront_cache_policy.CachingOptimized.id
    }

    "privacy" = {
      path_pattern           = "/privacy"
      allowed_methods        = ["GET", "HEAD"]
      cached_methods         = ["GET", "HEAD"]
      target_origin_id       = "${module.s3_legal_terms.id}.s3-website-eu-west-1.amazonaws.com"
      viewer_protocol_policy = "redirect-to-https"
      max_ttl                = 0
      compress              = true
      cache_policy_id       = data.aws_cloudfront_cache_policy.CachingOptimized.id
    }

    "terms" = {
      path_pattern           = "/terms"
      allowed_methods        = ["GET", "HEAD"]
      cached_methods         = ["GET", "HEAD"]
      target_origin_id       = "${module.s3_legal_terms.id}.s3-website-eu-west-1.amazonaws.com"
      viewer_protocol_policy = "redirect-to-https"
      max_ttl                = 0
      compress              = true
      cache_policy_id       = data.aws_cloudfront_cache_policy.CachingOptimized.id
    }

    "wildcard" = {
      path_pattern                = "/*"
      allowed_methods            = ["GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
      cached_methods             = ["GET", "HEAD"]
      target_origin_id          = "vevote-1755724031.ap-east-1.elb.amazonaws.com"
      viewer_protocol_policy    = "redirect-to-https"
      max_ttl                   = 0
      compress                  = true
      cache_policy_id           = data.aws_cloudfront_cache_policy.Cache_Control_Headers.id
      response_headers_policy_id = data.aws_cloudfront_response_headers_policy.Security_Headers_Policy.id
    }
  }

 origin = {
  "vevote-1755724031.ap-east-1.elb.amazonaws.com" = {
    // ELB located in Hong Kong
    domain_name = "vevote-1755724031.ap-east-1.elb.amazonaws.com"
    origin_id   = "vevote-1755724031.ap-east-1.elb.amazonaws.com"
    referer     = ""
    custom_origin_config = {
      http_port                = 80
      https_port               = 443
      origin_protocol_policy   = "https-only"
      origin_ssl_protocols     = ["TLSv1.2"]
      origin_keepalive_timeout = 5
      origin_read_timeout      = 30
    }
    connection_attempts = 3
    connection_timeout  = 10
  }
  "${module.s3_legal_terms.id}.s3-website-eu-west-1.amazonaws.com" = {
    domain_name = "${module.s3_legal_terms.id}.s3-website-eu-west-1.amazonaws.com"
    origin_id   = "${module.s3_legal_terms.id}.s3-website-eu-west-1.amazonaws.com"
    referer     = ""
    custom_origin_config = {
      http_port                = 80
      https_port               = 443
      origin_protocol_policy   = "http-only"
      origin_ssl_protocols     = ["SSLv3", "TLSv1", "TLSv1.1", "TLSv1.2"]
      origin_keepalive_timeout = 5
      origin_read_timeout      = 30
    }
    connection_attempts = 3
    connection_timeout  = 10
  }
}

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
}

output "domain_validation_records" {
  value = module.s3_static_cloudfront.domain_validation_records
}

data "aws_cloudfront_cache_policy" "Cache_Control_Headers" {
  name = "UseOriginCacheControlHeaders"
}

data "aws_cloudfront_response_headers_policy" "Security_Headers_Policy" {
  name = "Managed-SecurityHeadersPolicy"
}

data "aws_cloudfront_cache_policy" "CachingOptimized" {
  name = "Managed-CachingOptimized"
}