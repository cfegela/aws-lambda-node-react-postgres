# Node.js CRUD API with AWS Lambda

A serverless CRUD API built with Node.js, AWS Lambda, API Gateway, and PostgreSQL (RDS). Infrastructure is managed with Terraform.

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌────────────┐     ┌─────────┐
│   Client    │────▶│   API Gateway    │────▶│   Lambda   │────▶│   RDS   │
└─────────────┘     │  + Cognito Auth  │     │  (Node.js) │     │ Postgres│
                    └──────────────────┘     └────────────┘     └─────────┘
```

### Components

- **API Gateway**: REST API with CORS support
- **Cognito**: User authentication via JWT tokens
- **Lambda**: Node.js 20.x function handling CRUD operations
- **RDS**: PostgreSQL 15 database in private subnet
- **VPC**: Isolated network with public/private subnets and NAT gateway

## API Endpoints

All endpoints require Cognito authentication (Bearer token in Authorization header).

| Method | Endpoint      | Description         |
|--------|---------------|---------------------|
| GET    | /items        | List all items      |
| POST   | /items        | Create a new item   |
| GET    | /items/{id}   | Get item by ID      |
| PUT    | /items/{id}   | Update item by ID   |
| DELETE | /items/{id}   | Delete item by ID   |

### Request/Response Examples

**Create Item:**
```bash
curl -X POST ${API_URL}/items \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Item", "description": "Item description"}'
```

**Response:**
```json
{
  "id": 1,
  "name": "My Item",
  "description": "Item description",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

## Prerequisites

- [Terraform](https://www.terraform.io/downloads) >= 1.0
- [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate credentials
- [Node.js](https://nodejs.org/) >= 18.x (for local development)

## Deployment

1. **Initialize Terraform:**
   ```bash
   terraform init
   ```

2. **Review the deployment plan:**
   ```bash
   terraform plan
   ```

3. **Deploy the infrastructure:**
   ```bash
   terraform apply
   ```

4. **Note the outputs:**
   ```bash
   terraform output
   ```

## Configuration

Configure via `variables.tf` or pass variables at runtime:

| Variable          | Default         | Description                  |
|-------------------|-----------------|------------------------------|
| aws_region        | us-east-1       | AWS region                   |
| project_name      | node-crud-api   | Resource naming prefix       |
| environment       | dev             | Environment (used in stage)  |
| vpc_cidr          | 10.0.0.0/16     | VPC CIDR block               |
| db_name           | cruddb          | Database name                |
| db_username       | dbadmin         | Database username            |
| db_instance_class | db.t3.micro     | RDS instance size            |

Example with custom values:
```bash
terraform apply \
  -var="project_name=my-api" \
  -var="environment=prod" \
  -var="db_instance_class=db.t3.small"
```

## Outputs

After deployment, Terraform provides:

- `api_url` - Base URL for API requests
- `cognito_user_pool_id` - Cognito User Pool ID
- `cognito_client_id` - Cognito App Client ID
- `cognito_domain` - Cognito hosted UI domain
- `rds_endpoint` - Database endpoint (for debugging)
- `db_password` - Database password (sensitive)

## Authentication

1. **Create a user** in the Cognito User Pool (via AWS Console or CLI)

2. **Get an access token:**
   ```bash
   aws cognito-idp initiate-auth \
     --client-id ${COGNITO_CLIENT_ID} \
     --auth-flow USER_PASSWORD_AUTH \
     --auth-parameters USERNAME=${EMAIL},PASSWORD=${PASSWORD}
   ```

3. **Use the token** in API requests:
   ```bash
   curl ${API_URL}/items \
     -H "Authorization: Bearer ${ACCESS_TOKEN}"
   ```

## Project Structure

```
.
├── main.tf           # Terraform config and providers
├── variables.tf      # Input variables
├── outputs.tf        # Output values
├── vpc.tf            # VPC, subnets, NAT gateway, security groups
├── rds.tf            # PostgreSQL RDS instance
├── lambda.tf         # Lambda function and packaging
├── api_gateway.tf    # API Gateway REST API and methods
├── cognito.tf        # Cognito User Pool and authorizer
├── iam.tf            # IAM roles and policies
└── lambda/
    ├── index.mjs     # Lambda handler (Node.js ES modules)
    └── package.json  # Node.js dependencies
```

## Cleanup

To destroy all resources:

```bash
terraform destroy
```

## Security Notes

- Database is in a private subnet, not publicly accessible
- Lambda runs inside the VPC with controlled egress via NAT gateway
- RDS security group only allows traffic from Lambda security group
- All API endpoints require Cognito authentication
- Database password is auto-generated and stored in Terraform state
