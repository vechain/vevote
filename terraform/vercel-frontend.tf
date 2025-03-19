resource "vercel_project" "vevote_frontend" {
  count     = terraform.workspace == "prd" ? 1 : 0
  name      = "vevote-frontend"
  team_id   = local.env.vercel_team_id
  framework = "nextjs"
  git_repository = {
    type              = "github"
    repo              = "vechain/vevote"
    production_branch = "main"
  }
  root_directory = "apps/frontend"
}

resource "vercel_deployment" "vevote_frontend_deployment" {
  count      = terraform.workspace == "prd" ? 1 : 0
  project_id = vercel_project.vevote_frontend[0].id
  team_id    = local.env.vercel_team_id
  production = true
  ref        = local.env.tag
}
