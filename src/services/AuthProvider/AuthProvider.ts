import { Profile } from './../../schema/Profile/Profile';
import { env } from '@src/config';
import { ManagementClient } from 'auth0';
import DataLoader from 'dataloader';
import { getModelForClass } from '@typegoose/typegoose';

export const AuthProvider = new ManagementClient({
    domain: env.AUTH0_DOMAIN,
    clientId: env.AUTH0_CLIENT_ID,
    clientSecret: env.AUTH0_SECRET,
    scope: 'read:users update:users',
});

export const UserLoader = new DataLoader<string, Profile>(
    async (keys: readonly string[]) => {
        const ProfileModel = getModelForClass(Profile);
        const docs = await ProfileModel.find({ user_id: { $in: [...keys] } });

        if (docs.length === keys.length) {
            return keys.map(
                (key) =>
                    docs.find((d) => d.user_id === key) ||
                    new Error('Failed to find user with id ' + key)
            );
        } else {
            const cachedKeys = docs.map((d) => d.user_id + '');
            const missingKeys = [
                ...keys.filter((k) => !cachedKeys.includes(k)),
            ];

            const additionalDocs: Profile[] = [];

            for (const id of missingKeys) {
                const fromAuth0 = await AuthProvider.getUser({ id });
                additionalDocs.push(
                    await (await ProfileModel.create(fromAuth0)).toJSON()
                );
            }

            return keys.map(
                (key) =>
                    [...docs, ...additionalDocs].find(
                        (d) => d.user_id === key
                    ) || new Error('Failed to find user with id ' + key)
            );
        }
    }
);
