resource "vercel_project" "vevote_project_frontend" {
  name      = local.env.project
  framework = "nextjs"
  git_repository = {
    type              = "github"
    repo              = "vechain/vevote"
    production_branch = "main"
  }
  root_directory = "apps/frontend"
}

resource "vercel_deployment" "vevote_frontend_deployment_prd" {
  project_id = vercel_project.vevote_project.id
  production = true
  ref        = "main"
}
