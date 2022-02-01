import { UnitLoader } from './../schema/Unit/Unit';
import { RecipeVersionLoader } from './../schema/RecipeVersion/RecipeVersion';
import { RecipeLoader } from './../schema/Recipe/Recipe';
import { QualityCheckLoader } from './../schema/QualityCheck/QualityCheck';
import { TeamLoader } from './../schema/Team/Team';
import { UserLoader } from '@src/services/AuthProvider/AuthProvider';
import { ProductionLineLoader } from './../schema/ProductionLine/ProductionLine';
import { OrganizationLoader } from './../schema/Organization/Organization';
import { LotLoader } from './../schema/Lot/Lot';
import { LocationLoader } from './../schema/Location/Location';
import { ItineraryLoader } from './../schema/Itinerary/Itinerary';
import { ItemLoader } from '@src/schema/Item/Item';
import { FulfillmentLoader } from './../schema/Fulfillment/Fulfillment';
import { FolderLoader } from './../schema/Folder/Folder';
import { ExpenseLoader } from './../schema/Expense/Expense';
import { CompanyLoader } from './../schema/Company/Company';
import { BolLoader } from './../schema/Bol/Bol';
import { BatchLoader } from './../schema/Batch/Batch';
import { Context } from '@src/auth/context';
import { Permitted } from '@src/auth/middleware/Permitted';
import { UserRole } from '@src/auth/UserRole';
import { Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';
import { MyContext, MyContextLoader } from './MyContext';

@Resolver(() => MyContext)
export class MyContextResolvers {
    @UseMiddleware(Permitted())
    @Query(() => MyContext)
    async context(@Ctx() context: Context): Promise<MyContext> {
        return await MyContextLoader.load(context.base.created_by);
    }

    @UseMiddleware(Permitted({ type: 'role', role: UserRole.Admin }))
    @Mutation(() => Boolean)
    async clearContext(): Promise<boolean> {
        BatchLoader.clearAll();
        BolLoader.clearAll();
        CompanyLoader.clearAll();
        ExpenseLoader.clearAll();
        FolderLoader.clearAll();
        FulfillmentLoader.clearAll();
        ItemLoader.clearAll();
        ItineraryLoader.clearAll();
        LocationLoader.clearAll();
        LotLoader.clearAll();
        OrganizationLoader.clearAll();
        ProductionLineLoader.clearAll();
        QualityCheckLoader.clearAll();
        RecipeLoader.clearAll();
        RecipeVersionLoader.clearAll();
        TeamLoader.clearAll();
        UnitLoader.clearAll();
        UserLoader.clearAll();

        return true;
    }
}
