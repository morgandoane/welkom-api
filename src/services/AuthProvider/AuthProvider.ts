import { env } from '@src/config';
import { ManagementClient, User } from 'auth0';
import DataLoader from 'dataloader';

export const AuthProvider = new ManagementClient({
    domain: env.AUTH0_DOMAIN,
    clientId: env.AUTH0_CLIENT_ID,
    clientSecret: env.AUTH0_SECRET,
    scope: 'read:users update:users',
});

export const UserLoader = new DataLoader<string, User>(
    async (keys: readonly string[]) => {
        const docs = await AuthProvider.getUsers({ page: 0 });

        return keys.map(
            (k) =>
                docs.find((d) => d._id.toString() === k) ||
                new Error('could not find User with id ' + k)
        );
    }
);
