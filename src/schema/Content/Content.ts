import { Location } from '../Location/Location';
import { Unit } from '../Unit/Unit';
import { prop, Ref } from '@typegoose/typegoose';
import { Item } from '../Item/Item';
import { Lot } from '../Lot/Lot';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class Content {
    @Field()
    @prop({ required: true })
    quantity!: number;

    @Field(() => Unit)
    @prop({ required: true, ref: () => Unit })
    unit!: Ref<Unit>;
}

@ObjectType()
export class ItemContent extends Content {
    @Field(() => Item)
    @prop({ required: true, ref: () => Item })
    item!: Ref<Item>;
}

@ObjectType()
export class ItemPluralContent extends Content {
    @Field(() => Item)
    @prop({ required: true, ref: () => Item })
    items!: Ref<Item>[];
}

@ObjectType()
export class OrderContent extends ItemContent {
    @Field(() => Location)
    @prop({ required: true, ref: () => Location })
    location!: Ref<Location>;
}

@ObjectType()
export class LotContent extends Content {
    @Field(() => Lot)
    @prop({ required: true, ref: () => Lot })
    lot!: Ref<Lot>;
}
