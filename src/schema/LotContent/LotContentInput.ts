import { ItemLoader } from '@src/schema/Item/Item';
import { LotLoader } from './../Lot/Lot';
import { LotContent } from './LotContent';
import { Ref } from '@typegoose/typegoose';
import { Min } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { Lot } from '../Lot/Lot';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { BaseUnit } from '../Unit/BaseUnit';
import { Unit } from '../Unit/Unit';
import { getId } from '@src/utils/getId';
import { UserInputError } from 'apollo-server-core';

@InputType()
export class LotContentInput {
    @Field(() => ObjectIdScalar)
    lot!: Ref<Lot>;

    @Min(0)
    @Field()
    quantity!: number;

    // must match the base unit of the lots item
    @Field(() => BaseUnit)
    base_unit!: BaseUnit;

    @Min(0)
    @Field()
    client_quantity!: number;

    @Field(() => ObjectIdScalar)
    client_unit!: Ref<Unit>;

    public async validateLotContent(): Promise<LotContent> {
        const lot = await LotLoader.load(this.lot, true);
        const item = await ItemLoader.load(lot.item, true);
        if (item.base_unit !== this.base_unit)
            throw new UserInputError(
                'Base Unit must match that of the lots item'
            );
        const content: LotContent = {
            ...getId(),
            ...this,
        };

        return content;
    }
}
