import { Unit } from './../../Unit/Unit';
import { Company } from '@src/schema/Company/Company';
import { Location } from '@src/schema/Location/Location';
import { Item } from '@src/schema/Item/Item';
import { prop, Ref } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
class ItemPreference {
    @Field(() => String)
    @prop({ required: true, ref: () => Item })
    item!: Ref<Item>;

    @Field()
    @prop({ required: true })
    tally!: number;

    @Field(() => String)
    @prop({ required: true, ref: () => Company })
    vendor!: Ref<Company>;

    @Field()
    @prop({ required: true })
    quantity!: number;

    @Field(() => String)
    @prop({ required: true, ref: () => Unit })
    unit!: Ref<Unit>;

    @Field(() => String)
    @prop({ required: true, ref: () => Location })
    destination!: Ref<Location>;

    @Field({ nullable: true })
    @prop({ required: false })
    time!: number | null;
}

@ObjectType()
export class OrderQueuePreference {
    @Field(() => [ItemPreference])
    @prop({ required: true, type: () => ItemPreference })
    items!: ItemPreference[];
}
