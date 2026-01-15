terraform {
  backend "s3" {
    bucket       = "mpsm-terraform-state"
    key          = "aws-lambda-node-readt-postgres/terraform.tfstate"
    region       = "us-east-1"
    use_lockfile = true
  }
}
