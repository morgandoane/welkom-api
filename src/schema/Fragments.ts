import { MixingCard } from './MixingCard/MixingCard';
import { Batch } from './Batch/Batch';
import { ProfileIdentifier } from './ProfileIdentifier/ProfileIdentifier';
import { RecipeVersion } from './RecipeVersion/RecipeVersion';
import { Verification } from './Verification/Verification';
import { QualityCheck } from './QualityCheck/QualityCheck';
import { Team } from './Team/Team';
import { Conversion } from './Conversion/Conversion';
import { Contact } from './Contact/Contact';
import { Base } from '@src/schema/Base/Base';
import { ProceduralLot } from './Lot/extensions/ProceduralLot/ProceduralLot';
import { BucketLot } from './Lot/extensions/BucketLot/BucketLot';
import { Unit } from './Unit/Unit';
import { Recipe } from './Recipe/Recipe';
import { Order } from './Order/Order';
import { Lot } from './Lot/Lot';
import { Location } from './Location/Location';
import { Itinerary } from './Itinerary/Itinerary';
import { Item } from './Item/Item';
import { Fulfillment } from './Fulfillment/Fulfillment';
import { Folder } from './Folder/Folder';
import { Expense } from './Expense/Expense';
import { Company } from './Company/Company';
import { Bol } from './Bol/Bol';
import { createUnionType, Query, Resolver } from 'type-graphql';

export const BaseUnion = createUnionType({
    name: 'BaseUnion',
    types: () =>
        [
            Batch,
            Bol,
            BucketLot,
            Company,
            Contact,
            Conversion,
            Expense,
            Folder,
            Fulfillment,
            Item,
            Itinerary,
            Location,
            Lot,
            MixingCard,
            ProceduralLot,
            ProfileIdentifier,
            Order,
            Recipe,
            RecipeVersion,
            Team,
            Unit,
            Verification,
            QualityCheck,
        ] as const,
});

@Resolver(() => Base)
export class BaseUnionResolvers {
    @Query(() => BaseUnion)
    baseUnion(): typeof BaseUnion {
        return null;
    }
}
