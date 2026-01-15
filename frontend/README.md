# CRUD API Frontend

React frontend application for the serverless CRUD API with AWS Cognito authentication.

## Features

- AWS Cognito authentication
- Full CRUD operations (Create, Read, Update, Delete)
- Responsive design
- Real-time item management

## Prerequisites

- Node.js (v14 or higher)
- Access to the deployed Lambda API
- Valid Cognito user credentials

## Installation

```bash
cd frontend
npm install
```

## Configuration

The application is pre-configured with the following settings in `src/config.js`:

- **API Endpoint**: https://p18d2f73tc.execute-api.us-east-1.amazonaws.com/dev
- **Cognito User Pool ID**: us-east-1_UP8ZjyLuA
- **Cognito Client ID**: 46q14pecj6lgbgthpmgfpl96dv

## Test Credentials

- **Email**: test@example.com
- **Password**: TestPass123!

## Running the Application

```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Usage

1. **Login**: Use the test credentials to log in
2. **View Items**: See all items in the database
3. **Add Item**: Click "Add New Item" to create a new item
4. **Edit Item**: Click "Edit" on any item card to update it
5. **Delete Item**: Click "Delete" on any item card to remove it
6. **Logout**: Click "Logout" to return to the login page

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Login.js          # Login component
│   │   ├── Login.css         # Login styles
│   │   ├── Items.js          # Items management component
│   │   └── Items.css         # Items styles
│   ├── config.js             # AWS configuration
│   ├── App.js                # Main app component
│   ├── App.css               # Global styles
│   └── index.js              # Entry point
├── package.json
└── README.md
```

## Technologies Used

- React 18
- AWS Amplify
- Amazon Cognito Identity SDK
- AWS Lambda (Backend API)
- AWS API Gateway
