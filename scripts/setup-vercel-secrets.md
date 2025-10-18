# Setting Up Vercel Secrets for GitHub Actions

This guide will help you configure the required secrets for automatic Vercel deployment via GitHub Actions.

## Required Secrets

You need to add these three secrets to your GitHub repository:

1. `VERCEL_TOKEN`
2. `VERCEL_ORG_ID`
3. `VERCEL_PROJECT_ID`

## Step-by-Step Setup

### 1. Get Vercel Token

1. Go to [Vercel Dashboard](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Give it a descriptive name (e.g., "GitHub Actions Interview Timer")
4. Set expiration (recommended: 1 year)
5. Copy the generated token

### 2. Get Vercel Organization ID

1. Go to your [Vercel Team Settings](https://vercel.com/teams)
2. Select your team/organization
3. Go to "Settings" → "General"
4. Copy the "Team ID" (this is your Organization ID)

### 3. Get Vercel Project ID

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to "Settings" → "General"
4. Copy the "Project ID"

### 4. Add Secrets to GitHub

1. Go to your GitHub repository
2. Click "Settings" tab
3. In the left sidebar, click "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Add each secret:

   **Secret 1:**
   - Name: `VERCEL_TOKEN`
   - Value: [paste your Vercel token]

   **Secret 2:**
   - Name: `VERCEL_ORG_ID`
   - Value: [paste your organization ID]

   **Secret 3:**
   - Name: `VERCEL_PROJECT_ID`
   - Value: [paste your project ID]

## Verification

After adding the secrets:

1. Push a change to the `main` branch
2. Go to the "Actions" tab in your GitHub repository
3. Watch the CI/CD pipeline run
4. The deployment job should succeed and deploy to Vercel

## Troubleshooting

### Common Issues

**"Vercel deployment failed"**

- Double-check all three secrets are correctly set
- Ensure the Vercel token has proper permissions
- Verify the project ID matches your Vercel project

**"Organization not found"**

- Verify the `VERCEL_ORG_ID` is correct
- Ensure the token has access to the organization

**"Project not found"**

- Verify the `VERCEL_PROJECT_ID` is correct
- Ensure the project exists in your Vercel account

### Getting Help

- Check the GitHub Actions logs for detailed error messages
- Verify your Vercel account has the project properly configured
- Ensure your GitHub repository has the correct permissions

## Security Notes

- Never commit these secrets to your repository
- Rotate your Vercel token periodically
- Use the minimum required permissions for the token
- Consider using environment-specific tokens for different environments
