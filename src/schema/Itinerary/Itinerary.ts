import { setItineraryStatus } from './setItineraryStatus';
import { Company } from './../Company/Company';
import { ItineraryStatus } from '@src/schema/Itinerary/ItineraryStatus';
import { Order } from './../Order/Order';
import { Expensed } from './../Expensed/Expensed';
import {
    getModelForClass,
    modelOptions,
    pre,
    prop,
    Ref,
} from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { getBaseLoader } from '@src/utils/baseLoader';

export enum ItineraryType {
    Internal = 'Internal',
    External = 'External',
}

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'itineraries',
    },
})
@pre<Itinerary>('save', async function () {
    const status = await setItineraryStatus(this);
    this.status = status;
})
export class Itinerary extends Expensed {
    @Field({ nullable: true })
    @prop({ required: false })
    code!: string | null;

    @Field(() => Company, { nullable: true })
    @prop({ required: false, ref: () => Company })
    carrier!: Ref<Company> | null;

    @Field(() => Order, { nullable: true })
    @prop({ required: false, ref: () => Order })
    order_link!: Ref<Order> | null;

    @Field(() => ItineraryStatus)
    @prop({ required: false, enum: ItineraryStatus })
    status?: ItineraryStatus;
}

export const ItineraryModel = getModelForClass(Itinerary);
export const ItineraryLoader = getBaseLoader(ItineraryModel);
