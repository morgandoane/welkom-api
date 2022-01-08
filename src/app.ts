import { env } from './config';

import { ApolloServer } from 'apollo-server-express';
import express from 'express';

// GraphQL
import { buildSchema } from 'type-graphql';
import { registerEnums } from './utils/registerEnums';

// Resolvers
import { AppFileResolvers } from './schema/AppFile/AppFileResolvers';
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
import { ProceduralLotResolvers } from './schema/Lot/extensions/ProceduralLot/ProceduralLotResolvers';
import { ProfileResolvers } from './schema/Profile/ProfileResolvers';
import { QualityCheckResponseResolvers } from './schema/QualityCheckResponse/QualityCheckResponseResoilvers';
import { QualityCheckResolvers } from './schema/QualityCheck/QualityCheckResolvers';
import { RecipeFolderResolvers } from './schema/Folder/extensions/RecipeFolder/RecipeFolderResolvers';
import { SignedUrlResolvers } from './schema/SignedUrl/SignedUrlResolvers';
import { TeamResolvers } from './schema/Team/TeamResolvers';
import { UnitResolvers } from './schema/Unit/UnitResolvers';
import { VerificationResolvers } from './schema/Verification/VerificationResolvers';
import {
    ContentResolver,
    ItemContentResolver,
    ItemPluralContentResolver,
    LotContentResolver,
    OrderContentResolver,
} from './schema/Content/ContentResolvers';

// Serve locally over https
import https from 'https';
import fs from 'fs';
import { mongoose } from '@typegoose/typegoose';
import { AuthProvider } from './services/AuthProvider/AuthProvider';
import createContext from './auth/middleware/ContextMiddleware';

const httpsOptions = {
    key: fs.readFileSync('./cert/key.pem'),
    cert: fs.readFileSync('./cert/cert.pem'),
};

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
                BaseUnionResolvers,
                BolResolvers,
                BolAppointmentResolvers,
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
