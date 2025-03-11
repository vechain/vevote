provider "aws" {
  region = "eu-west-1"
  default_tags {
    tags = {
      Terraform = "true"
      Project   = "vevote"
    }
  }
}

terraform {
  backend "s3" {
    key                  = "vevote-vercel-project/vercel.tfstate"
    region               = "eu-west-1"
    workspace_key_prefix = "workspaces"
  }
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.3"
    }
  }
}
