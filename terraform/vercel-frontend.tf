resource "vercel_project" "vevote_frontend" {
  count     = terraform.workspace == "prod" ? 1 : 0
  name      = "${local.config.project}-frontend-${local.environment}"
  team_id   = local.config.vercel_team_id
  framework = "vite"
  git_repository = {
    type              = "github"
    repo              = "vechain/vevote"
    production_branch = "main"
  }
  root_directory   = "apps/"
  build_command    = "yarn build:staging"
  dev_command      = "yarn dev:staging"
  output_directory = "frontend/dist"

  environment = [
    {
      name  = "VECHAIN_URL_DEVNET"
      value = local.config.vercel_frontend_env.vechain_url_devnet
    },
    {
      name  = "PUBLIC_IPFS_PINNING_SERVICE"
      value = local.config.vercel_frontend_env.public_ipfs_pinning_service
    },
    {
      name  = "DEVNET_STAGING_MNEMONIC"
      value = local.config.vercel_frontend_env.devnet_staging_mnemonic
    },
    {
      name  = "MNEMONIC"
      value = local.config.vercel_frontend_env.mnemonic
    }
  ]
}

resource "vercel_deployment" "vevote_frontend_deployment" {
  count      = terraform.workspace == "prod" ? 1 : 0
  project_id = vercel_project.vevote_frontend[0].id
  team_id    = local.config.vercel_team_id
  production = true
  ref        = local.config.tag
}
