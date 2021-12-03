import { env } from '@src/config';
import { ManagementClient } from 'auth0';

export const AuthProvider = new ManagementClient({
    domain: env.AUTH0_DOMAIN,
    clientId: env.AUTH0_CLIENT_ID,
    clientSecret: env.AUTH0_SECRET,
    scope: 'read:users update:users',
});
