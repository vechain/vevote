# Vercel Frontend Project - Changes based on workspace
resource "vercel_project" "vevote_frontend" {
  name      = "${local.config.project}-frontend-${terraform.workspace}"
  team_id   = local.config.vercel_team_id
  framework = "vite"
  git_repository = {
    type              = "github"
    repo              = "vechain/vevote"
    production_branch = "main"
  }
  root_directory   = "apps"
  build_command    = terraform.workspace == "prod" ? "yarn build:mainnet" : "yarn build:staging"
  output_directory = "frontend/dist"
  dev_command      = terraform.workspace == "prod" ? "yarn dev:mainnet" : "yarn dev:staging"
  # Set environment variables based on workspace
  environment = terraform.workspace == "prod" ? [
    {
      key    = "VECHAIN_URL_DEVNET"
      value  = local.config.all_environments.vechain_url_devnet
      target = ["production", "preview", "development"]
    },
    {
      key    = "PUBLIC_IPFS_PINNING_SERVICE"
      value  = local.config.all_environments.public_ipfs_pinning_service
      target = ["production", "preview", "development"]
    },
    {
      key    = "DEVNET_STAGING_MNEMONIC"
      value  = local.config.all_environments.devnet_staging_mnemonic
      target = ["production", "preview"]
    },
    {
      key    = "MNEMONIC"
      value  = local.config.all_environments.mnemonic
      target = ["production", "preview"]
    }
    ] : [
    {
      key    = "VECHAIN_URL_DEVNET"
      value  = local.config.all_environments.vechain_url_devnet
      target = ["production", "preview", "development"]
    },
    {
      key    = "PUBLIC_IPFS_PINNING_SERVICE"
      value  = local.config.all_environments.public_ipfs_pinning_service
      target = ["production", "preview", "development"]
    },
    {
      key    = "DEVNET_STAGING_MNEMONIC"
      value  = local.config.all_environments.devnet_staging_mnemonic
      target = ["production", "preview"]
    },
    {
      key    = "MNEMONIC"
      value  = local.config.all_environments.mnemonic
      target = ["production", "preview"]
    }
  ]
}

resource "vercel_deployment" "vevote_frontend_deployment" {
  project_id = vercel_project.vevote_frontend.id
  team_id    = local.config.vercel_team_id
  production = false
  ref        = "main"
}
