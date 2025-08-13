terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }
  backend "s3" {
    # The S3 backend bucket is configured in '../environments/prod.config'
    key                  = "vevote-resources.tfstate"
    region               = "eu-west-1"
    workspace_key_prefix = "workspaces"
  }
}

provider "aws" {
  region = local.env.region
  default_tags {
    tags = {
      Terraform = "true"
      Project   = local.env.project
    }
  }
}

provider "aws" {
  region = "us-east-1"
  alias  = "useast1"
}
