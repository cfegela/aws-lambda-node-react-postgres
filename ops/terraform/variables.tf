variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "node-crud-api"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "cruddb"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "dbadmin"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "route53_zone_id" {
  description = "Route53 hosted zone ID for the domain"
  type        = string
  default     = "" # Set this if you want to use a custom domain
}

variable "frontend_domain" {
  description = "Custom domain for the frontend (leave empty to use CloudFront domain)"
  type        = string
  default     = ""
}

variable "acm_certificate_arn" {
  description = "ACM certificate ARN for HTTPS (required if using custom domain)"
  type        = string
  default     = ""
}
