import { AppStorage } from './../../services/CloudStorage/CloudStorage';
import express from 'express';
import jwksClient from 'jwks-rsa';
import jwt from 'jsonwebtoken';
import { env } from '@src/config';
import { Context } from '../context';
import { UserRole } from '../UserRole';
import { Permission } from '../permissions';

const client = jwksClient({
    jwksUri: `https://${env.AUTH0_DOMAIN}/.well-known/jwks.json`,
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
});

function getKey(header, callback) {
    client.getSigningKey(header.kid, function (error, key) {
        if (key) {
            const signingKey = key.getPublicKey();
            callback(null, signingKey);
        } else callback(null, null);
    });
}

const createContext = async (
    req: express.Request<unknown>,
    authToken: string
): Promise<Context> => {
    try {
        const token = req.headers.authorization;

        const storage = AppStorage;

        if (!token) {
            return new Context(null, authToken, [], [], storage);
        }

        const authResult = await new Promise<jwt.JwtPayload>(
            (resolve, reject) => {
                jwt.verify(
                    token.slice(7),
                    getKey,
                    {
                        audience: env.AUTH0_NAMEPSACE,
                        issuer: `https://${env.AUTH0_DOMAIN}/`,
                        algorithms: ['RS256'],
                    },
                    (error, decoded) => {
                        if (error) {
                            reject({ error });
                        }
                        if (decoded) {
                            resolve(decoded);
                        }
                    }
                );
            }
        );

        const decoded = await authResult;

        const roles = decoded[`${env.AUTH0_NAMEPSACE}/roles`];

        const permissions = roles.includes(UserRole.Admin)
            ? Object.values(Permission)
            : decoded[`${env.AUTH0_NAMEPSACE}/permissions`];

        // permissions and roles come from Auth0 Actions
        // return new Context(decoded, authToken, roles, permissions);
        return new Context(decoded, authToken, roles, permissions, storage);
    } catch (err) {
        return new Context(null, authToken, [], [], null);
    }
};

export default createContext;
