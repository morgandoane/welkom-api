import { Item } from '@src/schema/Item/Item';
import { prop, Ref } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { Unit } from '../Unit/Unit';

@ObjectType()
export class BolContent {
    @Field(() => Item)
    @prop({ required: true, ref: () => Item })
    item!: Ref<Item>;

    @Field()
    @prop({ required: true })
    quantity!: number;

    @Field()
    @prop({ required: true })
    client_quantity!: number;

    @Field(() => Unit)
    @prop({ required: true, ref: () => Unit })
    client_unit!: Ref<Unit>;
}
