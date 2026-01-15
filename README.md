# Serverless CRUD API with React Frontend

A full-stack serverless CRUD application built with React, Node.js, AWS Lambda, API Gateway, RDS PostgreSQL, and Cognito authentication. Infrastructure is managed with Terraform.

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌────────────┐     ┌─────────┐
│   React     │────▶│   API Gateway    │────▶│   Lambda   │────▶│   RDS   │
│  Frontend   │     │  + Cognito Auth  │     │  (Node.js) │     │ Postgres│
└─────────────┘     └──────────────────┘     └────────────┘     └─────────┘
```

### Components

- **React Frontend**: Modern UI with AWS Cognito authentication
- **API Gateway**: REST API with CORS support
- **Cognito**: User authentication via JWT tokens
- **Lambda**: Node.js 20.x function handling CRUD operations with SSL support
- **RDS**: PostgreSQL 15 database in private subnet
- **VPC**: Isolated network with public/private subnets and NAT gateway

## Features

- Full CRUD operations (Create, Read, Update, Delete)
- AWS Cognito authentication
- Responsive React frontend
- Serverless architecture
- Secure database connections with SSL
- Infrastructure as Code with Terraform

## Prerequisites

- [Terraform](https://www.terraform.io/downloads) >= 1.0
- [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate credentials
- [Node.js](https://nodejs.org/) >= 18.x
- AWS Account with appropriate permissions

## Quick Start

### 1. Deploy Infrastructure

```bash
# Navigate to the Terraform directory
cd ops/terraform

# (Optional) Configure custom domain settings
# Copy terraform.tfvars.example to terraform.tfvars and update with your values
cp terraform.tfvars.example terraform.tfvars

# Initialize Terraform
terraform init

# Review the deployment plan
terraform plan

# Deploy the infrastructure
terraform apply -auto-approve

# Note the outputs (API URL, Cognito IDs, etc.)
terraform output
```

### 2. Create Test User

```bash
# Create a test user in Cognito
aws cognito-idp admin-create-user \
  --user-pool-id <USER_POOL_ID> \
  --username test@example.com \
  --temporary-password TempPass123! \
  --message-action SUPPRESS

# Set permanent password
aws cognito-idp admin-set-user-password \
  --user-pool-id <USER_POOL_ID> \
  --username test@example.com \
  --password TestPass123! \
  --permanent
```

### 3. Configure Frontend

```bash
cd frontend
# Copy the example config and update with your values
cp src/config.example.js src/config.js
```

Edit `frontend/src/config.js` and replace the placeholder values with your actual AWS resource IDs from the Terraform outputs:

```javascript
export const awsConfig = {
  region: 'us-east-1',
  userPoolId: '<cognito_user_pool_id from terraform output>',
  userPoolWebClientId: '<cognito_client_id from terraform output>',
  apiEndpoint: '<api_url from terraform output without /items>'
};
```

### 4. Run Frontend

```bash
npm install
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

**Test Credentials:**
- Email: `test@example.com`
- Password: `TestPass123!`

## API Endpoints

All endpoints require Cognito authentication (Bearer token in Authorization header).

| Method | Endpoint      | Description         |
|--------|---------------|---------------------|
| GET    | /items        | List all items      |
| POST   | /items        | Create a new item   |
| GET    | /items/{id}   | Get item by ID      |
| PUT    | /items/{id}   | Update item by ID   |
| DELETE | /items/{id}   | Delete item by ID   |

### Testing with curl

**Get authentication token:**
```bash
ID_TOKEN=$(aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id <CLIENT_ID> \
  --auth-parameters USERNAME=test@example.com,PASSWORD=TestPass123! \
  --query 'AuthenticationResult.IdToken' \
  --output text)
```

**List all items:**
```bash
curl -X GET "<API_URL>/items" \
  -H "Authorization: Bearer ${ID_TOKEN}"
```

**Create an item:**
```bash
curl -X POST "<API_URL>/items" \
  -H "Authorization: Bearer ${ID_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Item","description":"Item description"}'
```

**Get specific item:**
```bash
curl -X GET "<API_URL>/items/1" \
  -H "Authorization: Bearer ${ID_TOKEN}"
```

**Update an item:**
```bash
curl -X PUT "<API_URL>/items/1" \
  -H "Authorization: Bearer ${ID_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","description":"Updated description"}'
```

**Delete an item:**
```bash
curl -X DELETE "<API_URL>/items/1" \
  -H "Authorization: Bearer ${ID_TOKEN}"
```

### Response Example

```json
{
  "id": 1,
  "name": "My Item",
  "description": "Item description",
  "created_at": "2026-01-15T10:30:00.000Z",
  "updated_at": "2026-01-15T10:30:00.000Z"
}
```

## Project Structure

```
.
├── ops/
│   └── terraform/           # Terraform infrastructure code
│       ├── main.tf          # Terraform config and providers
│       ├── variables.tf     # Input variables
│       ├── outputs.tf       # Output values
│       ├── state.tf         # Remote state configuration
│       ├── vpc.tf           # VPC, subnets, NAT gateway, security groups
│       ├── rds.tf           # PostgreSQL RDS instance
│       ├── lambda.tf        # Lambda function and packaging
│       ├── api_gateway.tf   # API Gateway REST API and methods
│       ├── cognito.tf       # Cognito User Pool and authorizer
│       ├── iam.tf           # IAM roles and policies
│       ├── cloudfront.tf    # CloudFront distribution
│       ├── s3_frontend.tf   # S3 bucket for frontend hosting
│       ├── route53.tf       # Route53 DNS records
│       └── terraform.tfvars.example  # Example variables file
├── lambda/
│   ├── index.mjs            # Lambda handler with SSL support
│   ├── package.json         # Node.js dependencies
│   └── package-lock.json
└── frontend/                # React application
    ├── src/
    │   ├── components/
    │   │   ├── Login.js     # Cognito login page
    │   │   ├── Login.css
    │   │   ├── Items.js     # CRUD operations UI
    │   │   └── Items.css
    │   ├── config.js        # AWS configuration
    │   ├── config.example.js  # Example config file
    │   ├── App.js           # Main app component
    │   └── App.css
    ├── package.json
    └── README.md
```

## Configuration

Configure via `variables.tf` or pass variables at runtime:

| Variable          | Default         | Description                  |
|-------------------|-----------------|------------------------------|
| aws_region        | us-east-1       | AWS region                   |
| project_name      | node-crud-api   | Resource naming prefix       |
| environment       | dev             | Environment (used in stage)  |
| vpc_cidr          | 10.0.0.0/16     | VPC CIDR block               |
| db_name              | cruddb          | Database name                          |
| db_username          | dbadmin         | Database username                      |
| db_instance_class    | db.t3.micro     | RDS instance size                      |
| route53_zone_id      | ""              | Route53 zone ID (for custom domain)    |
| frontend_domain      | ""              | Custom domain (e.g., app.example.com)  |
| acm_certificate_arn  | ""              | ACM certificate ARN (for HTTPS)        |

Example with custom values:
```bash
terraform apply \
  -var="project_name=my-api" \
  -var="environment=prod" \
  -var="db_instance_class=db.t3.small"
```

## Terraform Outputs

After deployment, Terraform provides:

- `api_url` - Base URL for API requests
- `api_gateway_id` - API Gateway REST API ID
- `cognito_user_pool_id` - Cognito User Pool ID
- `cognito_client_id` - Cognito App Client ID
- `cognito_domain` - Cognito hosted UI domain
- `lambda_function_name` - Lambda function name
- `rds_endpoint` - Database endpoint (for debugging)
- `vpc_id` - VPC ID
- `db_password` - Database password (sensitive)

## Frontend Application

The React frontend provides a complete UI for managing items with authentication.

### Features

- AWS Cognito authentication with login page
- Create, read, update, and delete items
- Responsive card-based layout
- Real-time updates
- Error handling and loading states
- Modern gradient design

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

See [frontend/README.md](frontend/README.md) for detailed documentation.

## Security Notes

- Database is in a private subnet, not publicly accessible
- Lambda runs inside the VPC with controlled egress via NAT gateway
- Lambda uses SSL/TLS for PostgreSQL connections
- RDS security group only allows traffic from Lambda security group
- All API endpoints require Cognito authentication
- Database password is auto-generated and stored in Terraform state
- Frontend uses secure JWT tokens for API authentication
- **IMPORTANT**: Never commit `frontend/src/config.js` with real AWS credentials
- Terraform state files contain sensitive data and are excluded from version control

## Key Implementation Details

### SSL Database Connection

The Lambda function is configured to connect to RDS using SSL encryption:

```javascript
pool = new Pool({
  // ... connection details
  ssl: {
    rejectUnauthorized: false
  }
});
```

This resolves the RDS requirement for encrypted connections.

### Infrastructure Components

The application creates 53+ AWS resources including:
- VPC with public and private subnets across 2 AZs
- NAT Gateway for Lambda internet access
- RDS PostgreSQL instance
- Lambda function with VPC configuration
- API Gateway with REST API and Cognito authorizer
- Cognito User Pool and Client
- IAM roles and security groups
- Route tables and network configuration

## Troubleshooting

### Lambda can't connect to RDS

- Ensure Lambda is in the same VPC as RDS
- Verify security group rules allow Lambda to access RDS on port 5432
- Check that SSL is enabled in the Lambda code

### Frontend can't authenticate

- Verify the Cognito User Pool ID and Client ID in `frontend/src/config.js`
- Ensure the user exists and has a permanent password
- Check browser console for detailed error messages

### API returns 401 Unauthorized

- Ensure you're using the ID token (not access token) in the Authorization header
- Verify the token hasn't expired (default 1 hour)
- Check that the Cognito authorizer is properly configured

## Cleanup

To destroy all resources:

```bash
cd ops/terraform
terraform destroy
```

**Warning:** This will delete all data including the database.

## Development

### Local Lambda Testing

```bash
cd lambda
npm install
node -e "import('./index.mjs').then(m => m.handler({...}))"
```

### Frontend Development

```bash
cd frontend
npm start  # Development server with hot reload
npm run build  # Production build
npm test  # Run tests
```

## License

This project is provided as-is for educational and demonstration purposes.

## Contributing

Feel free to submit issues and pull requests for improvements.
