resource "vercel_project" "vevote_frontend" {
  name      = "vevote-frontend"
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
  production = true
  ref        = local.env.tag
}
