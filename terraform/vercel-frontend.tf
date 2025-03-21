resource "vercel_project" "vevote_frontend" {
  name      = "${local.config.project}-frontend-${local.environment}"
  team_id   = local.config.vercel_team_id
  framework = "nextjs"
  git_repository = {
    type              = "github"
    repo              = "vechain/vevote"
    production_branch = "main"
  }
  root_directory = "apps/frontend"
}

resource "vercel_deployment" "vevote_frontend_deployment" {
  project_id = vercel_project.vevote_frontend.id
  team_id    = local.config.vercel_team_id
  production = true
  ref        = local.config.tag
}
