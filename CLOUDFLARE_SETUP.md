# Cloudflare Pages Deployment Guide

This guide explains how to deploy the Tripbook application to Cloudflare Pages using GitHub Actions.

## Prerequisites

1. A Cloudflare account with Pages enabled
2. A Cloudflare Pages project created
3. GitHub repository with appropriate secrets configured

## Project Configuration

### 1. Astro Configuration

The project uses `@astrojs/cloudflare` adapter for SSR (Server-Side Rendering) on Cloudflare Pages.

**Configuration file:** `astro.config.mjs`

```javascript
adapter: cloudflare({
  platformProxy: {
    enabled: true,
  },
});
```

This enables:

- Server-side rendering on Cloudflare Workers
- Access to Cloudflare runtime APIs
- Platform proxy for local development

### 2. Required GitHub Secrets

Configure the following secrets in your GitHub repository (`Settings` → `Secrets and variables` → `Actions`):

| Secret Name               | Description                                 | Example                   |
| ------------------------- | ------------------------------------------- | ------------------------- |
| `CLOUDFLARE_API_TOKEN`    | Cloudflare API token with Pages permissions | `abc123...`               |
| `CLOUDFLARE_ACCOUNT_ID`   | Your Cloudflare Account ID                  | `12345678...`             |
| `CLOUDFLARE_PROJECT_NAME` | Cloudflare Pages project name               | `tripbook`                |
| `SUPABASE_URL`            | Supabase project URL                        | `https://xxx.supabase.co` |
| `SUPABASE_KEY`            | Supabase anon/public key                    | `eyJ...`                  |
| `GOOGLE_ROUTES_API_KEY`   | Google Routes API key                       | `AIza...`                 |

### 3. Cloudflare API Token Setup

To create a Cloudflare API Token:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **My Profile** → **API Tokens**
3. Click **Create Token**
4. Use the **Edit Cloudflare Workers** template or create a custom token with:
   - **Permissions:**
     - Account → Cloudflare Pages → Edit
   - **Account Resources:**
     - Include → Your specific account
5. Copy the generated token and add it as `CLOUDFLARE_API_TOKEN` secret

### 4. Finding Your Account ID

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your account
3. Go to **Workers & Pages**
4. Your Account ID is displayed on the right sidebar

## CI/CD Workflow

### Master Branch Deployment

**Workflow file:** `.github/workflows/master.yml`

The deployment workflow runs on every push to the `master` branch and includes:

#### Jobs:

1. **Lint** - Code quality checks with ESLint
2. **Unit Tests** - Run Vitest unit tests with coverage
3. **Build** - Build the Astro application
4. **Deploy** - Deploy to Cloudflare Pages

#### Workflow Triggers:

- `push` to `master` branch
- Manual trigger via `workflow_dispatch`

### Environment Variables

The build step uses the following environment variables:

- `SUPABASE_URL`
- `SUPABASE_KEY`
- `GOOGLE_ROUTES_API_KEY`

These are injected during the build process and become available at runtime.

## Deployment Process

1. **Code Push:** Push code to `master` branch
2. **Lint & Test:** Automated linting and unit tests run
3. **Build:** Application is built with production configuration
4. **Deploy:** Built assets are deployed to Cloudflare Pages
5. **URL Available:** Deployment URL is available in workflow output

### Viewing Deployment

After deployment:

- Check the GitHub Actions summary for the deployment URL
- Visit your Cloudflare Pages dashboard to see the deployment
- The production URL will be: `https://<project-name>.pages.dev`

## Local Development

To test the Cloudflare adapter locally:

```bash
# Install dependencies
npm ci

# Run in development mode (with Cloudflare platform proxy)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Environment-Specific Configuration

### Development

- Uses Node.js adapter (for local dev server)
- `.env` file for local environment variables

### Production (Cloudflare Pages)

- Uses Cloudflare adapter
- Environment variables configured in GitHub Secrets
- Injected during build in CI/CD pipeline

## Troubleshooting

### Build Fails

1. Check that all required secrets are configured in GitHub
2. Verify environment variables are correctly set in the workflow
3. Review build logs in GitHub Actions

### Deployment Fails

1. Verify `CLOUDFLARE_API_TOKEN` has correct permissions
2. Check that `CLOUDFLARE_ACCOUNT_ID` is correct
3. Ensure `CLOUDFLARE_PROJECT_NAME` matches your Pages project

### Runtime Issues

1. Check Cloudflare Pages function logs in dashboard
2. Verify environment variables are available at runtime
3. Test locally with `npm run preview`

## Differences from Node.js Deployment

| Aspect     | Node.js             | Cloudflare Pages      |
| ---------- | ------------------- | --------------------- |
| Runtime    | Node.js server      | Cloudflare Workers    |
| Adapter    | `@astrojs/node`     | `@astrojs/cloudflare` |
| Deployment | Traditional hosting | Edge computing        |
| Cold start | Slower              | Instant (edge)        |
| Scaling    | Manual/VPS          | Automatic             |
| Cost       | Server costs        | Pay-per-request       |

## Additional Resources

- [Astro Cloudflare Adapter Documentation](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Support

For issues related to:

- **Astro configuration:** Check Astro documentation
- **Cloudflare deployment:** Check Cloudflare dashboard logs
- **GitHub Actions:** Review workflow run logs
- **Application errors:** Check Cloudflare Pages function logs
