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
}

data "aws_caller_identity" "current" {}

module "github_oidc" {
  source = "git@github.com:vechain/terraform_infrastructure_modules.git//openid/github?ref=v.1.0.53"

  repo_names = ["vevote"]
  repo_org   = "vechain"
  env        = terraform.workspace
  project    = "vevote"
}

output "account_id" {
  value = data.aws_caller_identity.current.account_id
}
