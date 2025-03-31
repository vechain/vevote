terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
  backend "s3" {
    key                  = "github_oidc/github_oidc.tfstate"
    region               = "eu-west-1"
    workspace_key_prefix = "workspaces"
  }
}

provider "aws" {
  region = "eu-west-1"
  default_tags {
    tags = {
      Terraform   = "true"
      Project     = "vevote"
      Module      = "openid"
      Environment = terraform.workspace
    }
  }
}
