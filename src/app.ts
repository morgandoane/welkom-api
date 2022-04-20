import { env } from './config';

import { ApolloServer } from 'apollo-server-express';
import express from 'express';

// GraphQL
import { buildSchema } from 'type-graphql';
import { registerEnums } from './utils/registerEnums';

// Resolvers
import { AppFileResolvers } from './schema/AppFile/AppFileResolvers';
import { BatchResolvers } from './schema/Batch/BatchResolvers';
import { BatchLineResolvers } from './schema/BatchLine/BatchLineResolvers';
import { BolFileResolvers } from './schema/AppFile/extensons/BolFile/BolFile';
import { BaseUnionResolvers } from './schema/Fragments';
import { BolResolvers } from './schema/Bol/BolResolvers';
import { BolAppointmentResolvers } from './schema/Bol/BolAppointmentResolvers';
import { BucketLotResolvers } from './schema/Lot/extensions/BucketLot/BucketLotResolvers';
import { CodeResolvers } from './schema/Code/CodeResolvers';
import { CompanyResolvers } from './schema/Company/CompanyResolvers';
import { ContactResolvers } from './schema/Contact/ContactResolvers';
import { ConversionResolvers } from './schema/Conversion/ConversionResolvers';
import { ExpenseResolvers } from './schema/Expense/ExpenseResolvers';
import { FolderResolvers } from './schema/Folder/FolderResolvers';
import { FulfillmentResolvers } from './schema/Fulfillment/FulfillmentResolvers';
import { ItemResolvers } from './schema/Item/ItemResolvers';
import { ItineraryResolvers } from './schema/Itinerary/ItineraryResolvers';
import { LocationResolvers } from './schema/Location/LocationResolvers';
import { LotResolvers } from './schema/Lot/LotResolvers';
import { MixingCardResolvers } from './schema/MixingCard/MixingCardResolvers';
import { MixingCardLineResolvers } from './schema/MixingCardLine/MixingLineResolvers';
import { OrderResolvers } from './schema/Order/OrderResolvers';
import { OrderQueueResolvers } from './schema/OrderQueue/OrderQueueResolvers';
import { OrderQueueContentResolvers } from './schema/OrderQueue/OrderQueueContentResolvers';
import { OrderStatisticResolvers } from './schema/OrderStatistic/OrderStatisticResolvers';
import { PalletResolvers } from './schema/Pallet/PalletResolvers';
import { PalletCardResolvers } from './schema/PalletCard/PalletCardResolvers';
import { ProceduralLotResolvers } from './schema/Lot/extensions/ProceduralLot/ProceduralLotResolvers';
import { ProductionLineResolvers } from './schema/ProductionLine/ProductionLineResolvers';
import { ProfileResolvers } from './schema/Profile/ProfileResolvers';
import { ProfileIdentifierResolvers } from './schema/ProfileIdentifier/ProfileIdentifierResolvers';
import { QualityCheckResponseResolvers } from './schema/QualityCheckResponse/QualityCheckResponseResolvers';
import { QualityCheckResolvers } from './schema/QualityCheck/QualityCheckResolvers';
import { RecipeResolvers } from './schema/Recipe/RecipeResolvers';
import { RecipeVersionResolvers } from './schema/RecipeVersion/RecipeVersionResolvers';
import { SignedUrlResolvers } from './schema/SignedUrl/SignedUrlResolvers';
import { TeamResolvers } from './schema/Team/TeamResolvers';
import { TrayResolvers } from './schema/Tray/TrayResolvers';
import { UnitResolvers } from './schema/Unit/UnitResolvers';
import { VerificationResolvers } from './schema/Verification/VerificationResolvers';
import { WorkbookResolvers } from './schema/Workbook/WorkbookResolvers';
import {
    BolItemContentResolver,
    ContentResolver,
    ItemContentResolver,
    ItemPluralContentResolver,
    LotContentResolver,
    OrderContentResolver,
    ProceduralLotContentResolver,
} from './schema/Content/ContentResolvers';

import { mongoose } from '@typegoose/typegoose';
import { AuthProvider } from './services/AuthProvider/AuthProvider';
import createContext from './auth/middleware/ContextMiddleware';

import fs from 'fs';
import https from 'https';
import { ItemCategoryResolvers } from './schema/ItemCategory/ItemCategoryResolvers';

(async () => {
    try {
        // Setup Express
        const app = express();

        registerEnums();

        mongoose.Promise = global.Promise;
        await mongoose.connect(env.ATLAS_URL, {});

        // Setup GraphQL with Apollo
        const schema = await buildSchema({
            resolvers: [
                AppFileResolvers,
                BatchResolvers,
                BatchLineResolvers,
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
                ExpenseResolvers,
                FolderResolvers,
                FulfillmentResolvers,
                ItemResolvers,
                ItemCategoryResolvers,
                ItemContentResolver,
                ItemPluralContentResolver,
                ItineraryResolvers,
                LocationResolvers,
                LotResolvers,
                LotContentResolver,
                MixingCardResolvers,
                MixingCardLineResolvers,
                OrderContentResolver,
                OrderResolvers,
                OrderQueueResolvers,
                OrderQueueContentResolvers,
                OrderStatisticResolvers,
                PalletResolvers,
                PalletCardResolvers,
                ProceduralLotResolvers,
                ProfileResolvers,
                ProfileIdentifierResolvers,
                ProceduralLotContentResolver,
                ProductionLineResolvers,
                QualityCheckResolvers,
                QualityCheckResponseResolvers,
                RecipeResolvers,
                RecipeVersionResolvers,
                SignedUrlResolvers,
                TeamResolvers,
                TrayResolvers,
                UnitResolvers,
                VerificationResolvers,
                WorkbookResolvers,
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
