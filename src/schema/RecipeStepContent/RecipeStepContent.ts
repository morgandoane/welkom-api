import { Identified } from './../Base/Base';
import { Field, ObjectType } from 'type-graphql';
import { Item } from '../Item/Item';
import { prop, Ref } from '@typegoose/typegoose';
import { Unit } from '../Unit/Unit';

@ObjectType()
export class RecipeStepContent extends Identified {
    @Field(() => [Item])
    @prop({ required: true, ref: () => Item, minlength: 1 })
    items!: Ref<Item>[];

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
