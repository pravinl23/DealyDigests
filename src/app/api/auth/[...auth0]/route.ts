import { handleAuth } from "@auth0/nextjs-auth0";

const auth0Handler = handleAuth();

export const GET = auth0Handler;
export const POST = auth0Handler;
