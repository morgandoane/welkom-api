import { env } from './config';

import express from 'express';

// GraphQL
import { buildSchema } from 'type-graphql';
import { registerEnums } from './utils/registerEnums';

// Resolvers
import { AppFileResolvers } from './schema/AppFile/AppFileResolvers';
import { AppointmentResolvers } from './schema/Appointment/AppointmentResolvers';
import { BatchLotContentResolvers } from './schema/BatchLotContent/BatchLotContentResolvers';
import { BatchResolvers } from './schema/Batch/BatchResolvers';
import { BolContentResolvers } from './schema/BolContent/BolContentResolvers';
import { BolResolvers } from './schema/Bol/BolResolvers';
import { CompanyResolvers } from './schema/Company/CompanyResolvers';
import { DesignResolvers } from './schema/Design/DesignResolvers';
import { ExpenseResolvers } from './schema/Expense/ExpenseResolvers';
import { ExpenseSummaryResolvers } from './schema/ExpenseSummary/ExpenseSummaryResolvers';
import { FolderResolvers } from './schema/Folder/FolderResolvers';
import { FulfillmentResolvers } from './schema/Fulfillment/FulfillmentResolvers';
import { IngredientResolvers } from './schema/Item/extensions/Ingredient/IngredientResolvers';
import { ItineraryResolvers } from './schema/Itinerary/ItineraryResolvers';
import { LocationResolvers } from './schema/Location/LocationResolvers';
import { LotResolvers } from './schema/Lot/LotResolvers';
import { LotContentResolvers } from './schema/LotContent/LotContentResolvers';
import { MiscItemResolvers } from './schema/Item/extensions/Misc/MiscItemResolvers';
import { MyContextResolvers } from './contextual/MyContextResolvers';
import { OrganizationResolvers } from './schema/Organization/OrganizationResolvers';
import { OrderResolvers } from './schema/Order/OrderResolvers';
import { PackagingResolvers } from './schema/Item/extensions/Packaging/PackagingResolvers';
import { ProductResolvers } from './schema/Item/extensions/Product/ProductResolvers';
import { UnitResolvers } from './schema/Unit/UnitResolvers';
import { RecipeVersionResolvers } from './schema/RecipeVersion/RecipeVersionResolvers';
import { RecipeStepContentResolvers } from './schema/RecipeStepContent/RecipeStepContentResolvers';
import { RecipeResolvers } from './schema/Recipe/RecipeResolvers';
import { QualityCheckResolvers } from './schema/QualityCheck/QualityCheckResolvers';
import { ProfileResolvers } from './schema/Profile/ProfileResolvers';
import { ProductionLineResolvers } from './schema/ProductionLine/ProductionLineResolvers';
import { SignedUrlResolvers } from './schema/SignedUrl/SignedUrlResolvers';
import { TeamResolvers } from './schema/Team/TeamResolvers';
import { ItemUnionResolvers } from './schema/Unions/ItemUnion';
import { ExpensedUnionResolvers } from './schema/Unions/ExpensedUnion';
import { BaseUnionResolvers } from './schema/Unions/BaseUnion';
import { HoldResolvers } from './schema/Hold/HoldResolvers';
import { UploadEnabledResolvers } from './schema/Unions/UploadEnabledUnion';
import { OrderQueueLineResolvers } from './schema/OrderQueueLine/OrderQueueLineResolvers';
import { OrderQueueResolvers } from './schema/OrderQueue/OrderQueueResolvers';
import { OrderAppointmentResolvers } from './schema/OrderAppointment/OrderAppointmentResolvers';
import { UserPreferenceResolvers } from './schema/UserPreference/UserPreferenceResolvers';
import { ItemResolver } from './schema/Item/ItemResolver';
import { CodeResolvers } from './schema/Code/CodeResolers';
import { BolAppointmentResolvers } from './schema/BolAppointment/BolAppointmentResolvers';
import {
    ItineraryScheduleStageResolvers,
    ItinerarySchedulePathResolvers,
} from './schema/ItinerarySchedule/ItineraryScheduleResolvers';

import { mongoose } from '@typegoose/typegoose';
import { AuthProvider } from './services/AuthProvider/AuthProvider';
import createContext from './auth/middleware/ContextMiddleware';

import fs from 'fs';
import https from 'https';
import { ApolloServer } from 'apollo-server-express';

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
                AppointmentResolvers,
                BaseUnionResolvers,
                BatchResolvers,
                BatchLotContentResolvers,
                BolAppointmentResolvers,
                BolContentResolvers,
                BolResolvers,
                CodeResolvers,
                CompanyResolvers,
                DesignResolvers,
                ExpenseResolvers,
                ExpenseSummaryResolvers,
                ExpensedUnionResolvers,
                FolderResolvers,
                FulfillmentResolvers,
                HoldResolvers,
                IngredientResolvers,
                ItemResolver,
                ItemUnionResolvers,
                ItineraryResolvers,
                LocationResolvers,
                LotResolvers,
                LotContentResolvers,
                MiscItemResolvers,
                MyContextResolvers,
                OrderResolvers,
                OrderAppointmentResolvers,
                OrderQueueResolvers,
                OrderQueueLineResolvers,
                OrganizationResolvers,
                PackagingResolvers,
                ProductResolvers,
                ProductionLineResolvers,
                ProfileResolvers,
                QualityCheckResolvers,
                RecipeResolvers,
                RecipeStepContentResolvers,
                RecipeVersionResolvers,
                SignedUrlResolvers,
                TeamResolvers,
                UnitResolvers,
                UploadEnabledResolvers,
                UserPreferenceResolvers,
                ItineraryScheduleStageResolvers,
                ItinerarySchedulePathResolvers,
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
