import { Identified } from './../Base/Base';
import { prop, Ref } from '@typegoose/typegoose';
import { Min } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';
import { Lot } from '../Lot/Lot';
import { BaseUnit } from '../Unit/BaseUnit';
import { Unit } from '../Unit/Unit';

@ObjectType()
export class LotContent extends Identified {
    @Field(() => Lot)
    @prop({ required: true, ref: 'Lot' })
    lot!: Ref<Lot>;

    @Min(0)
    @Field()
    @prop({ required: true, min: 0 })
    quantity!: number;

    // must match the base unit of the lots item
    @Field(() => BaseUnit)
    @prop({ required: true, enum: BaseUnit })
    base_unit!: BaseUnit;

    @Min(0)
    @Field()
    @prop({ required: true, min: 0 })
    client_quantity!: number;

    @Field(() => Unit)
    @prop({ required: true, ref: () => Unit })
    client_unit!: Ref<Unit>;
}
