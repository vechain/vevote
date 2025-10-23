locals {
  env = merge(yamldecode(file("../config/${terraform.workspace}/common.yaml")))
}
