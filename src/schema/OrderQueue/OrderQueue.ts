import { CompanyLoader } from './../Company/Company';
import { BolModel, BolStatus } from './../Bol/Bol';
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
import { getCompaniesForProfile } from '@src/utils/getCompaniesForProfile';

@ObjectType()
export class OrderQueueContent {
    @Field({ nullable: true })
    @prop({ required: false })
    order_code?: string;

    @Field(() => Company, { nullable: true })
    @prop({ required: false, ref: () => Company })
    vendor?: Ref<Company>;

    @Field(() => Location, { nullable: true })
    @prop({ required: false, ref: () => Location })
    vendor_location?: Ref<Location>;

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

export class PersonalOrderQueue extends OrderQueue {}

@ObjectType()
export class OrderQueueTemplate extends OrderQueue {
    @Field()
    @prop({ required: true })
    title!: string;
}

@ObjectType()
@pre<OrderQueueRecord>('save', async function () {
    for (const content of this.contents) {
        const destination = loaderResult(
            await LocationLoader.load(
                content.location ? content.location.toString() : ''
            )
        );
        const order: Order = {
            _id: new mongoose.Types.ObjectId(),
            deleted: false,
            created_by: this.author,
            date_created: this.date,
            vendor: content.vendor,
            customer: destination.company,
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
            carrier: content.vendor,
        };

        const destinationLocation = loaderResult(
            await LocationLoader.load(content.location.toString())
        );

        // BOL should only have a code if the *from* company (vendor) is "us"
        const vendor = loaderResult(
            await CompanyLoader.load(content.vendor.toString())
        );

        const profileCompanies = await (
            await getCompaniesForProfile(this.author)
        ).map((c) => c.toString());

        let code: string | null = null;

        if (profileCompanies.includes(vendor._id.toString())) {
            code = await CodeGenerator.generate(CodeType.BOL);
        }

        const bol: Bol = {
            _id: new mongoose.Types.ObjectId(),
            status: BolStatus.Pending,
            deleted: false,
            created_by: this.author,
            date_created: this.date,
            itinerary: itinerary._id,
            code,
            from: {
                _id: new mongoose.Types.ObjectId(),
                company: content.vendor,
                location: content.vendor_location,
                date: content.date,
            },
            to: {
                _id: new mongoose.Types.ObjectId(),
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
        };

        await OrderModel.create(order).catch((e) => {
            throw new Error(e);
        });

        await ItineraryModel.create(itinerary).catch((e) => {
            throw new Error(e);
        });

        await BolModel.create(bol).catch((e) => {
            throw new Error(e);
        });
    }
})
export class OrderQueueRecord extends OrderQueue {
    @Field()
    @prop({ required: true })
    date!: Date;
}

const OrderQueueModel = getModelForClass(OrderQueue);

export const PersonalOrderQueueModel = getDiscriminatorModelForClass(
    OrderQueueModel,
    PersonalOrderQueue
);

export const OrderQueueTemplateModel = getDiscriminatorModelForClass(
    OrderQueueModel,
    OrderQueueTemplate
);

export const OrderQueueRecordModel = getDiscriminatorModelForClass(
    OrderQueueModel,
    OrderQueueRecord
);
