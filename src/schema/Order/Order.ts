import { ItineraryModel } from '@src/schema/Itinerary/Itinerary';
import { BolModel } from './../Bol/Bol';
import { Itinerary } from './../Itinerary/Itinerary';
import { OrderContent } from './../Content/Content';
import { Base } from './../Base/Base';
import { getBaseLoader } from './../Loader';
import { Field, ObjectType } from 'type-graphql';
import {
    getModelForClass,
    modelOptions,
    pre,
    prop,
    Ref,
} from '@typegoose/typegoose';
import { Company } from '../Company/Company';
import { Expense } from '../Expense/Expense';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'orders',
    },
})
@pre<Order>('save', async function () {
    const theseItineraries = await ItineraryModel.find({
        deleted: false,
        orders: this._id,
    });

    for (const itin of theseItineraries) {
        const theseBols = await BolModel.find({
            deleted: false,
            itinierary: itin._id,
        });

        for (const bol of theseBols) {
            await BolModel.findOneAndUpdate(
                { _id: bol._id },
                { date_modified: new Date() }
            );
        }
    }
})
export class Order extends Base {
    @Field()
    @prop({ required: true })
    code!: string;

    @Field(() => Company, { nullable: true })
    @prop({ required: false, ref: () => Company })
    customer?: Ref<Company>;

    @Field(() => Company, { nullable: true })
    @prop({ required: false, ref: () => Company })
    vendor?: Ref<Company>;

    @Field(() => [OrderContent])
    @prop({ required: true, type: () => OrderContent })
    contents!: OrderContent[];

    @Field(() => [Itinerary])
    itineraries?: Itinerary[];

    @Field(() => [Expense])
    expenses?: Expense[];

    @Field({ nullable: true })
    @prop({ required: false })
    due?: Date;
}

export const OrderModel = getModelForClass(Order);

export const OrderLoader = getBaseLoader(OrderModel);
