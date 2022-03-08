import { Itinerary } from './../Itinerary/Itinerary';
import { BatchLot } from './../BatchLot/BatchLot';
import { Lot } from './../Lot/Lot';
import { Expensed } from './../Expensed/Expensed';
import { createUnionType, Query, Resolver } from 'type-graphql';

export const ExpensedUnion = createUnionType({
    name: 'ExpensedUnion',
    types: () => [Lot, BatchLot, Itinerary] as const,
});

@Resolver(() => Expensed)
export class ExpensedUnionResolvers {
    @Query(() => ExpensedUnion)
    expensedUnion(): typeof ExpensedUnion {
        return null;
    }
}
