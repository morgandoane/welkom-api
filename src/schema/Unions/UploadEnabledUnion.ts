import { Order } from './../Order/Order';
import { Recipe } from '../Recipe/Recipe';
import { Product } from '../Item/extensions/Product/Product';
import { ProductionLine } from '../ProductionLine/ProductionLine';
import { Packaging } from '../Item/extensions/Packaging/Packaging';
import { MiscItem } from '../Item/extensions/Misc/MiscItem';
import { Ingredient } from '../Item/extensions/Ingredient/Ingredient';
import { Item } from '../Item/Item';
import { Hold } from '../Hold/Hold';
import { Fulfillment } from '../Fulfillment/Fulfillment';
import { Lot } from '../Lot/Lot';
import { BatchLot } from '../BatchLot/BatchLot';
import { Itinerary } from '../Itinerary/Itinerary';
import { Team } from '../Team/Team';
import { Expense } from '../Expense/Expense';
import { Company } from '../Company/Company';
import { Bol } from '../Bol/Bol';
import { Batch } from '../Batch/Batch';
import { UploadEnabled } from '../UploadEnabled/UploadEnabled';
import { createUnionType, Query, Resolver } from 'type-graphql';
import { Location } from '../Location/Location';
import { Design } from '../Design/Design';

export const UploadEnabledUnion = createUnionType({
    name: 'UploadEnabledUnion',
    types: () =>
        [
            Batch,
            Bol,
            Company,
            Design,
            Expense,
            Team,
            Location,
            Itinerary,
            BatchLot,
            Lot,
            Fulfillment,
            Hold,
            Item,
            Ingredient,
            MiscItem,
            Packaging,
            Product,
            Recipe,
            ProductionLine,
            Order,
        ] as const,
});

@Resolver(() => UploadEnabled)
export class UploadEnabledResolvers {
    @Query(() => UploadEnabledUnion)
    uploadEnabledUnion(): typeof UploadEnabledUnion {
        return null;
    }
}
