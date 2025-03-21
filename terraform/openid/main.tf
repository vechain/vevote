module "github_oidc" {
  source = "git@github.com:vechain/terraform_infrastructure_modules.git//openid/github?ref=v.1.0.53"

  repo_names = ["vevote"]
  repo_org   = "vechain"
  env        = terraform.workspace
  project    = "vevote"
}
