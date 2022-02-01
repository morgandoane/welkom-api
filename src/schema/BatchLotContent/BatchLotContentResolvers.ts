import { RecipeStep } from './../RecipeStep/RecipeStep';
import { LotLoader } from './../Lot/Lot';
import { BatchlotContent } from './BatchlotContent';
import { FieldResolver, Resolver, Root } from 'type-graphql';
import { Lot } from '../Lot/Lot';
import { Unit, UnitLoader } from '../Unit/Unit';

@Resolver(() => BatchlotContent)
export class BatchLotContentResolvers {
    @FieldResolver(() => Lot)
    async lot(@Root() { lot }: BatchlotContent): Promise<Lot> {
        return await LotLoader.load(lot, true);
    }

    @FieldResolver(() => Unit)
    async client_unit(@Root() { client_unit }: BatchlotContent): Promise<Unit> {
        return await UnitLoader.load(client_unit, true);
    }
}
