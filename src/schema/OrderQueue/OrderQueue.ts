import { BolModel } from './../Bol/Bol';
import { ItineraryModel } from '@src/schema/Itinerary/Itinerary';
import { Itinerary } from './../Itinerary/Itinerary';
import {
    CodeGenerator,
    CodeType,
} from './../../services/CodeGeneration/CodeGeneration';
import { Location, LocationLoader } from './../Location/Location';
import { Unit } from './../Unit/Unit';
import { Item } from './../Item/Item';
import { Profile } from './../Profile/Profile';
import { Field, ID, ObjectType } from 'type-graphql';
import {
    prop,
    getModelForClass,
    Ref,
    getDiscriminatorModelForClass,
    mongoose,
    modelOptions,
    Severity,
    pre,
} from '@typegoose/typegoose';
import { Order, OrderModel } from '../Order/Order';
import { Bol } from '../Bol/Bol';
import { Company } from '../Company/Company';
import { loaderResult } from '@src/utils/loaderResult';

@ObjectType()
export class OrderQueueContent {
    @Field({ nullable: true })
    @prop({ required: false })
    order_code?: string;

    @Field(() => Company, { nullable: true })
    @prop({ required: false, ref: () => Company })
    company?: Ref<Company>;

    @Field(() => Item, { nullable: true })
    @prop({ required: false, ref: () => Item })
    item?: Ref<Item>;

    @Field(() => Unit, { nullable: true })
    @prop({ required: false, ref: () => Unit })
    unit?: Ref<Unit>;

    @Field({ nullable: true })
    @prop({ required: false })
    quantity?: number;

    @Field(() => Location, { nullable: true })
    @prop({ required: false, ref: () => Location })
    location?: Ref<Location>;

    @Field(() => Date, { nullable: true })
    @prop({ required: false })
    date?: Date;
}

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'orderQueues',
    },
    options: {
        allowMixed: Severity.ALLOW,
    },
})
export class OrderQueue {
    @Field(() => ID)
    @prop({ required: true })
    _id!: mongoose.Types.ObjectId;

    @Field(() => Profile)
    @prop({ required: true })
    author!: string;

    @Field(() => [OrderQueueContent])
    @prop({ required: true, type: () => OrderQueueContent })
    contents!: OrderQueueContent[];
}

@ObjectType()
export class OrderQueueTemplate extends OrderQueue {
    @Field()
    @prop({ required: true })
    title!: string;
}

@ObjectType()
@pre<OrderQueueRecord>('save', async function () {
    for (const content of this.contents) {
        const order: Order = {
            _id: new mongoose.Types.ObjectId(),
            deleted: false,
            created_by: this.author,
            date_created: this.date,
            code:
                content.order_code ||
                (await CodeGenerator.generate(CodeType.PO)),
            contents: [
                {
                    item: content.item,
                    unit: content.unit,
                    location: content.location,
                    quantity: content.quantity,
                    due: content.date,
                },
            ],
        };

        const itinerary: Itinerary = {
            _id: new mongoose.Types.ObjectId(),
            deleted: false,
            created_by: this.author,
            date_created: this.date,
            code: await CodeGenerator.generate(CodeType.ITIN),
            orders: [order._id],
        };

        const destinationLocation = loaderResult(
            await LocationLoader.load(content.location.toString())
        );

        const bol: Bol = {
            _id: new mongoose.Types.ObjectId(),
            deleted: false,
            created_by: this.author,
            date_created: this.date,
            itinerary: itinerary._id,
            code: await CodeGenerator.generate(CodeType.BOL),
            from: {
                company: content.company,
                date: content.date,
            },
            to: {
                company: destinationLocation.company,
                location: destinationLocation._id,
                date: content.date,
            },
            contents: [
                {
                    item: content.item,
                    unit: content.unit,
                    quantity: content.quantity,
                    fulfillment_percentage: 0,
                },
            ],
            shipments: [],
            receipts: [],
        };

        await OrderModel.create(order).catch((e) => {
            throw new console.error(e);
        });

        await ItineraryModel.create(itinerary).catch((e) => {
            throw new console.error(e);
        });

        await BolModel.create(bol).catch((e) => {
            throw new console.error(e);
        });
    }
})
export class OrderQueueRecord extends OrderQueue {
    @Field()
    @prop({ required: true })
    date!: Date;
}

export const OrderQueueModel = getModelForClass(OrderQueue);

export const OrderQueueTemplateModel = getDiscriminatorModelForClass(
    OrderQueueModel,
    OrderQueueTemplate
);

export const OrderQueueRecordModel = getDiscriminatorModelForClass(
    OrderQueueModel,
    OrderQueueRecord
);
