module "s3_legal_terms" {
  source                     = "git::git@github.com:vechain/terraform_infrastructure_modules.git//s3?ref=d6221a6dd80eff03ea1b520efac559a800222792" # v.3.1.5
  env                        = local.env.environment
  project                    = local.env.project
  app_name                   = "legal-documents"
  enable_deletion_protection = local.env.environment == "prod" ? true : false
  enable_public_access_block = true
  block_public_acls          = false
  block_public_policy        = false
  ignore_public_acls         = false
  restrict_public_buckets    = false
  bucket_policy              = true
  create_bucket_acl          = false
  bucket_key_enabled         = true
  object_ownership           = "BucketOwnerEnforced"
  aws_iam_policy_document    = data.aws_iam_policy_document.docs.json
}



data "aws_iam_policy_document" "docs" {
  version = "2012-10-17"
  statement {
    sid = "PublicReadGetObject"
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    effect    = "Allow"
    actions   = ["s3:GetObject"]
    resources = ["${module.s3_legal_terms.arn}/*"]
  }
}
