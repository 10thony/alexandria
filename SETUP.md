# Setup Guide

This guide will help you set up Alexandria with all the required services.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set up Convex

1. Run the Convex dev server:
   ```bash
   npm run convex:dev
   ```

2. This will:
   - Create a new Convex project (if you don't have one)
   - Generate a deployment URL (looks like `https://xxx.convex.cloud`)
   - Set up the database schema

3. Copy the Convex URL that appears in the terminal

## Step 3: Set up Clerk

1. Go to [clerk.com](https://clerk.com) and sign up/login
2. Create a new application
3. Go to "API Keys" in your Clerk dashboard
4. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)

## Step 4: Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_CONVEX_URL=https://your-project.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

Replace:
- `VITE_CONVEX_URL` with your Convex URL from Step 2
- `VITE_CLERK_PUBLISHABLE_KEY` with your Clerk publishable key from Step 3

## Step 5: Run the Development Server

```bash
npm run dev
```

The app should now be running at `http://localhost:3000`

## Step 6: Test the Integration

1. Visit `http://localhost:3000`
2. Click "Sign Up" to create a Clerk account
3. After signing in, visit the Dashboard page
4. You should see:
   - Your user information from Clerk
   - A Convex query example working
   - A button to test Convex mutations

## Deployment to Netlify

1. Push your code to GitHub/GitLab/Bitbucket
2. In Netlify:
   - Click "New site from Git"
   - Select your repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `.output/public`
   - Add environment variables:
     - `VITE_CONVEX_URL` - Your Convex deployment URL
     - `VITE_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key
3. Configure Clerk:
   - Add your Netlify URL to allowed origins
   - Update redirect URLs to include your Netlify domain

## Troubleshooting

### Convex not connecting
- Make sure `VITE_CONVEX_URL` is set correctly
- Run `npm run convex:dev` to ensure Convex is running

### Clerk authentication not working
- Verify `VITE_CLERK_PUBLISHABLE_KEY` is correct
- Check that your localhost URL is added to Clerk's allowed origins

### Build errors
- Make sure all dependencies are installed: `npm install`
- Check that Node.js version is 18+

