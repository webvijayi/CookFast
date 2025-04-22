# Deployment Guide

This guide provides instructions for deploying CookFast to various environments, including local development, Netlify, and Vercel.

## Local Development

### Prerequisites

- Node.js (Version 20 or later recommended)
- npm, yarn, or pnpm
- An API key for at least one of the supported AI providers

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/webvijayi/CookFast.git
   cd CookFast
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## Netlify Deployment

CookFast is optimized for deployment on Netlify, with specific configurations in the `netlify.toml` file and Netlify Edge Functions.

### Deployment Steps

1. **Fork or clone the repository**

2. **Connect to Netlify**
   - Log in to Netlify
   - Click "New site from Git"
   - Select your repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`

3. **Environment Variables**
   Set the following environment variables in Netlify:
   - `NEXT_PUBLIC_APP_URL`: Your application URL

4. **Deploy**
   - Click "Deploy site"
   - Netlify will build and deploy your site

### Netlify Edge Functions

CookFast uses Netlify Edge Functions for improved performance and reliability:

- Edge functions are defined in the `netlify/edge-functions` directory
- The `netlify.toml` file configures routes for these functions

## Vercel Deployment

CookFast can also be deployed on Vercel, which provides seamless integration with Next.js.

### Deployment Steps

1. **Fork or clone the repository**

2. **Connect to Vercel**
   - Log in to Vercel
   - Import your repository
   - Configure project settings:
     - Framework Preset: Next.js
     - Build Command: `next build`
     - Output Directory: `.next`

3. **Environment Variables**
   Set the following environment variables in Vercel:
   - `NEXT_PUBLIC_APP_URL`: Your application URL

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your site

## Docker Deployment

For containerized deployment, you can use Docker.

### Docker Build

1. **Build the Docker image**
   ```bash
   docker build -t cookfast .
   ```

2. **Run the Docker container**
   ```bash
   docker run -p 3000:3000 cookfast
   ```

3. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

The following environment variables can be configured for your deployment:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_APP_URL` | The URL where your application is hosted | No |
| `NEXT_PUBLIC_RATE_LIMIT_MAX` | Maximum number of requests per time window | No |
| `NEXT_PUBLIC_RATE_LIMIT_WINDOW_MS` | Time window for rate limiting (ms) | No |

## Build Optimization

For production deployments, consider the following optimizations:

1. **Enable caching**
   - Use CDN caching for static assets
   - Configure appropriate cache headers

2. **Optimize images**
   - Use Next.js Image optimization
   - Convert images to modern formats (WebP, AVIF)

3. **Monitor performance**
   - Use Lighthouse or similar tools to monitor performance
   - Address any performance issues identified

## Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   - Ensure all dependencies are installed
   - Check for compatibility issues between packages

2. **API Connection Issues**
   - Verify that environment variables are correctly set
   - Check network connectivity to AI providers

3. **Rate Limiting**
   - Adjust rate limiting parameters if needed
   - Implement proper error handling for rate limit errors

4. **Memory Limits**
   - Increase memory allocation for build processes if necessary
   - Optimize code to reduce memory usage

### Logs and Monitoring

For effective troubleshooting:

- Check application logs for errors
- Monitor API response times
- Track AI provider usage and quotas
- Set up alerts for critical errors

## Security Considerations

When deploying CookFast, consider these security best practices:

1. **Protect API Keys**
   - Never commit API keys to your repository
   - Use environment variables for sensitive information

2. **Enable HTTPS**
   - Always use HTTPS in production
   - Configure proper SSL/TLS settings

3. **Implement CSP**
   - Add Content Security Policy headers
   - Restrict access to external resources

4. **Regular Updates**
   - Keep dependencies up-to-date
   - Apply security patches promptly 