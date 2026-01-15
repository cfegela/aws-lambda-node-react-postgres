# Build Lambda deployment package
resource "null_resource" "lambda_build" {
  triggers = {
    source_hash  = filesha256("${path.module}/../../lambda/index.mjs")
    package_hash = filesha256("${path.module}/../../lambda/package.json")
  }

  provisioner "local-exec" {
    command     = "npm install --production"
    working_dir = "${path.module}/../../lambda"
  }
}

data "archive_file" "lambda" {
  type        = "zip"
  source_dir  = "${path.module}/../../lambda"
  output_path = "${path.module}/../../lambda.zip"

  depends_on = [null_resource.lambda_build]
}

# Lambda Function
resource "aws_lambda_function" "api" {
  filename         = data.archive_file.lambda.output_path
  function_name    = "${var.project_name}-api"
  role             = aws_iam_role.lambda.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.lambda.output_base64sha256
  runtime          = "nodejs20.x"
  timeout          = 30
  memory_size      = 256

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_HOST     = aws_db_instance.main.address
      DB_PORT     = "5432"
      DB_NAME     = var.db_name
      DB_USER     = var.db_username
      DB_PASSWORD = random_password.db_password.result
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic,
    aws_iam_role_policy_attachment.lambda_vpc,
  ]
}

# Lambda permission for API Gateway
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}
