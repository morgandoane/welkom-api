import { Unit, UnitLoader } from './../Unit/Unit';
import { Item, ItemLoader } from '@src/schema/Item/Item';
import { RecipeStepContent } from './RecipeStepContent';
import { FieldResolver, Resolver, Root } from 'type-graphql';

@Resolver(() => RecipeStepContent)
export class RecipeStepContentResolvers {
    @FieldResolver(() => [Item])
    async items(@Root() { items }: RecipeStepContent): Promise<Item[]> {
        return await ItemLoader.loadMany(items, true);
    }

    @FieldResolver(() => Unit)
    async client_unit(
        @Root() { client_unit }: RecipeStepContent
    ): Promise<Unit> {
        return await UnitLoader.load(client_unit, true);
    }
}
