import { Base } from './../Base/Base';
import { getBaseLoader } from './../Loader';
import { Company } from './../Company/Company';
import { Field, ObjectType } from 'type-graphql';
import { Bol } from '../Bol/Bol';
import {
    getModelForClass,
    modelOptions,
    prop,
    Ref,
} from '@typegoose/typegoose';
import { Order } from '../Order/Order';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'itineraries',
    },
})
export class Itinerary extends Base {
    @Field()
    @prop({ required: true })
    code!: string;

    @Field(() => [Order])
    @prop({ required: true, ref: 'Order' })
    orders!: Ref<Order>[];

    @Field(() => [Bol])
    bols?: Bol[];

    @Field(() => Company, { nullable: true })
    @prop({ required: false, ref: () => Company })
    carrier?: Ref<Company>;
}

export const ItineraryModel = getModelForClass(Itinerary);

export const ItineraryLoader = getBaseLoader(ItineraryModel);
