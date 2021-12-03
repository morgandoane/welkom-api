import dotenv from 'dotenv';
import 'module-alias/register';
import 'reflect-metadata';

dotenv.config();

export const env = {
    ATLAS_URL: process.env.ATLAS_URL,
    NODE_ENV: process.env.NODE_ENV,
    PORT: Number.parseInt(process.env.PORT || '8080'),
    CORS_WHITELIST: process.env.CORS_WHITELIST,
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    AUTH0_SECRET: process.env.AUTH0_SECRET,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_NAMEPSACE: process.env.AUTH0_NAMEPSACE,
};
