import { Item, ItemLoader } from '@src/schema/Item/Item';
import { UnitLoader } from './../Unit/Unit';
import { BolContent } from './BolContent';
import { FieldResolver, Resolver, Root } from 'type-graphql';
import { Unit } from '../Unit/Unit';

@Resolver(() => BolContent)
export class BolContentResolvers {
    @FieldResolver(() => Unit)
    async client_unit(@Root() { client_unit }: BolContent): Promise<Unit> {
        return await UnitLoader.load(client_unit, true);
    }

    @FieldResolver(() => Item)
    async item(@Root() { item }: BolContent): Promise<Item> {
        return await ItemLoader.load(item, true);
    }
}
