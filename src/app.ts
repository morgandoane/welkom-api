import { env } from './config';

import { ApolloServer } from 'apollo-server-express';
import express from 'express';

// GraphQL
import { buildSchema } from 'type-graphql';
import { registerEnums } from './utils/registerEnums';

// Resolvers
import { ConfigResolvers } from './schema/Config/ConfigResolvers';
import { createConfiguredResolver } from './schema/Configured/ConfiguredResolver';

// Serve locally over https
import https from 'https';
import fs from 'fs';
import { mongoose } from '@typegoose/typegoose';
import { AuthProvider } from './services/AuthProvider/AuthProvider';
import createContext from './auth/middleware/ContextMiddleware';
import { createBaseResolver } from './schema/Base/BaseResolvers';

const httpsOptions = {
    key: fs.readFileSync('./cert/key.pem'),
    cert: fs.readFileSync('./cert/cert.pem'),
};

(async () => {
    try {
        // Setup Express
        const app = express();

        const BaseResolver = createBaseResolver();
        const ConfiguredResolver = createConfiguredResolver();

        registerEnums();

        mongoose.Promise = global.Promise;
        await mongoose.connect(env.ATLAS_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
        });

        // Setup GraphQL with Apollo
        const schema = await buildSchema({
            resolvers: [BaseResolver, ConfigResolvers, ConfiguredResolver],
            validate: true,
        });

        const authToken = await AuthProvider.getAccessToken();

        const apollo = new ApolloServer({
            schema,
            context: async ({ req }) => createContext(req, authToken),
        });

        const httpServer = https.createServer(httpsOptions, app);

        await apollo.start();

        apollo.applyMiddleware({
            app,
            cors: {
                origin: function (origin, callback) {
                    if (
                        origin === undefined ||
                        env.CORS_WHITELIST.includes(origin)
                    ) {
                        callback(null, true);
                    } else {
                        callback(new Error('Blocked by CORS'));
                    }
                },
                credentials: true,
            },
        });

        httpServer.listen({ port: env.PORT }, () =>
            console.log(`Server ready and listening at port ${env.PORT}`)
        );
    } catch (error) {
        console.error(error);
    }
})();
