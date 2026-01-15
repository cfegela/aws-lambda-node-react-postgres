// Copy this file to config.js and replace with your actual AWS values
// Get these values from: terraform output
export const awsConfig = {
  region: 'us-east-1',
  userPoolId: 'YOUR_USER_POOL_ID',          // From terraform output cognito_user_pool_id
  userPoolWebClientId: 'YOUR_CLIENT_ID',    // From terraform output cognito_client_id
  apiEndpoint: 'YOUR_API_ENDPOINT'          // From terraform output api_url (remove /items suffix)
};
