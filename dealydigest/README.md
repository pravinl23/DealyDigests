This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, set up your Auth0 application:

1. Sign up for an Auth0 account at [https://auth0.com](https://auth0.com)
2. Create a new application of type "Regular Web Application"
3. In the settings, add the following URLs:
   - Allowed Callback URLs: `http://localhost:3000/auth/callback`
   - Allowed Logout URLs: `http://localhost:3000`
4. Copy your Auth0 Domain, Client ID, and Client Secret
5. Create a `.env.local` file in the root directory with the following content:
   ```
   AUTH0_DOMAIN=your-auth0-domain
   AUTH0_CLIENT_ID=your-client-id
   AUTH0_CLIENT_SECRET=your-client-secret
   AUTH0_SECRET=a-long-random-string-generated-with-openssl-rand-hex-32
   APP_BASE_URL=http://localhost:3000
   ```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Authentication Flow

This application uses Auth0 for authentication. The authentication flow is:

1. User clicks "Log In" button in the navbar
2. User is redirected to Auth0's login page
3. After successful authentication, user is redirected back to our application
4. The navbar dynamically updates to show user information and authenticated routes
5. Protected routes (like the dashboard) require authentication to access

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
