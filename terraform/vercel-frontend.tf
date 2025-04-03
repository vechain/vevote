resource "vercel_project" "vevote_frontend" {
  name      = "${local.config.project}-frontend-dev-experimental"
  team_id   = local.config.vercel_team_id
  framework = "vite"
  git_repository = {
    type              = "github"
    repo              = "vechain/vevote"
    production_branch = "main"
  }
  root_directory   = "apps"
  build_command    = "yarn clean && yarn build:staging"
  dev_command      = "yarn dev:staging"
  output_directory = "frontend/dist"

  lifecycle {
    ignore_changes = [
      enable_affected_projects_deployments
    ]
  }
}

resource "vercel_project_environment_variable" "vechain_url_devnet" {
  project_id = vercel_project.vevote_frontend.id
  key        = "VECHAIN_URL_DEVNET"
  value      = local.config.all_environments.vechain_url_devnet
  target     = ["production", "preview"]
}

resource "vercel_project_environment_variable" "public_ipfs_pinning_service" {
  project_id = vercel_project.vevote_frontend.id
  key        = "PUBLIC_IPFS_PINNING_SERVICE"
  value      = local.config.all_environments.public_ipfs_pinning_service
  target     = ["production", "preview"]
}

resource "vercel_project_environment_variable" "devnet_staging_mnemonic" {
  project_id = vercel_project.vevote_frontend.id
  key        = "DEVNET_STAGING_MNEMONIC"
  value      = local.config.all_environments.devnet_staging_mnemonic
  target     = ["production", "preview"]
}

resource "vercel_project_environment_variable" "mnemonic" {
  project_id = vercel_project.vevote_frontend.id
  key        = "MNEMONIC"
  value      = local.config.all_environments.mnemonic
  target     = ["production", "preview"]
}

resource "vercel_deployment" "vevote_frontend_deployment" {
  project_id = vercel_project.vevote_frontend.id
  team_id    = local.config.vercel_team_id
  production = false
  ref        = "main"
}
