import { prop, Ref } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { Configured } from '../Configured/Configured';
import { Location } from '../Location/Location';
import { Lot } from '../Lot/Lot';

@ObjectType()
export class Fulfillment extends Configured {
    @Field(() => [Lot])
    @prop({ required: true, ref: () => Lot })
    lots!: Ref<Lot>[];

    @Field(() => Location)
    @prop({ required: true, ref: () => Location })
    location!: Ref<Location>;
}
