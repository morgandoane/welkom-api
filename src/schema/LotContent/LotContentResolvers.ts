import { FieldResolver, Resolver, Root } from 'type-graphql';
import { Lot, LotLoader } from '../Lot/Lot';
import { Unit, UnitLoader } from '../Unit/Unit';
import { LotContent } from './LotContent';

@Resolver(() => LotContent)
export class LotContentResolvers {
    @FieldResolver(() => Lot)
    async lot(@Root() { lot }: LotContent): Promise<Lot> {
        return await LotLoader.load(lot, true);
    }

    @FieldResolver(() => Unit)
    async client_unit(@Root() { client_unit }: LotContent): Promise<Unit> {
        return await UnitLoader.load(client_unit, true);
    }
}
