import { env } from './config';

import { ApolloServer } from 'apollo-server-express';
import express from 'express';

// GraphQL
import { buildSchema } from 'type-graphql';
import { registerEnums } from './utils/registerEnums';

// Resolvers
import { AppFileResolvers } from './schema/AppFile/AppFileResolvers';
import { BolFileResolvers } from './schema/AppFile/extensons/BolFile/BolFile';
import { BaseUnionResolvers } from './schema/Fragments';
import { BolResolvers } from './schema/Bol/BolResolvers';
import { BolAppointmentResolvers } from './schema/Bol/BolAppointmentResolvers';
import { BucketLotResolvers } from './schema/Lot/extensions/BucketLot/BucketLotResolvers';
import { CodeResolvers } from './schema/Code/CodeResolvers';
import { CompanyResolvers } from './schema/Company/CompanyResolvers';
import { ContactResolvers } from './schema/Contact/ContactResolvers';
import { ConversionResolvers } from './schema/Conversion/ConversionResolvers';
import { FulfillmentResolvers } from './schema/Fulfillment/FulfillmentResolvers';
import { ItemResolvers } from './schema/Item/ItemResolvers';
import { ItineraryResolvers } from './schema/Itinerary/ItineraryResolvers';
import { LocationResolvers } from './schema/Location/LocationResolvers';
import { LotResolvers } from './schema/Lot/LotResolvers';
import { OrderResolvers } from './schema/Order/OrderResolvers';
import { OrderQueueResolvers } from './schema/OrderQueue/OrderQueueResolvers';
import { OrderQueueContentResolvers } from './schema/OrderQueue/OrderQueueContentResolvers';
import { OrderStatisticResolvers } from './schema/OrderStatistic/OrderStatisticResolvers';
import { ProceduralLotResolvers } from './schema/Lot/extensions/ProceduralLot/ProceduralLotResolvers';
import { ProfileResolvers } from './schema/Profile/ProfileResolvers';
import { QualityCheckResponseResolvers } from './schema/QualityCheckResponse/QualityCheckResponseResolvers';
import { QualityCheckResolvers } from './schema/QualityCheck/QualityCheckResolvers';
import { RecipeFolderResolvers } from './schema/Folder/extensions/RecipeFolder/RecipeFolderResolvers';
import { SignedUrlResolvers } from './schema/SignedUrl/SignedUrlResolvers';
import { TeamResolvers } from './schema/Team/TeamResolvers';
import { UnitResolvers } from './schema/Unit/UnitResolvers';
import { VerificationResolvers } from './schema/Verification/VerificationResolvers';
import {
    BolItemContentResolver,
    ContentResolver,
    ItemContentResolver,
    ItemPluralContentResolver,
    LotContentResolver,
    OrderContentResolver,
} from './schema/Content/ContentResolvers';

import { mongoose } from '@typegoose/typegoose';
import { AuthProvider } from './services/AuthProvider/AuthProvider';
import createContext from './auth/middleware/ContextMiddleware';

import fs from 'fs';
import https from 'https';

(async () => {
    try {
        // Setup Express
        const app = express();

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
            resolvers: [
                AppFileResolvers,
                BolFileResolvers,
                BaseUnionResolvers,
                BolResolvers,
                BolAppointmentResolvers,
                BolItemContentResolver,
                BucketLotResolvers,
                CodeResolvers,
                CompanyResolvers,
                ContactResolvers,
                ContentResolver,
                ConversionResolvers,
                FulfillmentResolvers,
                ItemResolvers,
                ItemContentResolver,
                ItemPluralContentResolver,
                ItineraryResolvers,
                LocationResolvers,
                LotResolvers,
                LotContentResolver,
                OrderContentResolver,
                OrderResolvers,
                OrderQueueResolvers,
                OrderQueueContentResolvers,
                OrderStatisticResolvers,
                ProceduralLotResolvers,
                ProfileResolvers,
                QualityCheckResolvers,
                QualityCheckResponseResolvers,
                RecipeFolderResolvers,
                SignedUrlResolvers,
                TeamResolvers,
                UnitResolvers,
                VerificationResolvers,
            ],
            validate: true,
        });

        const authToken = await AuthProvider.getAccessToken();

        const server = new ApolloServer({
            schema,
            context: async ({ req }) => createContext(req, authToken),
        });

        let httpServer;

        if (process.env.NODE_ENV !== 'production') {
            const httpsOptions = {
                key: fs.readFileSync('./cert/key.pem'),
                cert: fs.readFileSync('./cert/cert.pem'),
            };

            httpServer = https.createServer(httpsOptions, app);
        }

        await server.start();

        server.applyMiddleware({
            app,
            path: '/graphql',
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

        if (process.env.NODE_ENV == 'production') {
            app.listen({ port: process.env.PORT || 8080 }, (): void =>
                console.log(`🚀 Bangarang!`)
            );
        } else {
            httpServer.listen({ port: env.PORT }, () =>
                console.log(`Server ready and listening at port ${env.PORT}`)
            );
        }
    } catch (error) {
        console.error(error);
    }
})();
