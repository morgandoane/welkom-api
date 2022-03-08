import { Ingredient } from './../Item/extensions/Ingredient/Ingredient';
import { MiscItem } from './../Item/extensions/Misc/MiscItem';
import { Packaging } from './../Item/extensions/Packaging/Packaging';
import { Product } from './../Item/extensions/Product/Product';
import { createUnionType, Query, Resolver } from 'type-graphql';
import { Item } from '../Item/Item';

export const ItemUnion = createUnionType({
    name: 'ItemUnion',
    types: () => [Item, Ingredient, Product, Packaging, MiscItem] as const,
});

@Resolver(() => Item)
export class ItemUnionResolvers {
    @Query(() => ItemUnion)
    itemUnion(): typeof ItemUnion {
        return null;
    }
}
