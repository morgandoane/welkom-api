import { Itinerary } from './../Itinerary/Itinerary';
import { BolItemContent } from './../Content/Content';
import { LotLoader, LotModel } from './../Lot/Lot';
import { Item, ItemLoader } from './../Item/Item';
import { UnitLoader } from './../Unit/Unit';
import { LocationLoader } from './../Location/Location';
import { getBaseLoader } from './../Loader';
import { Base } from './../Base/Base';
import {
    Fulfillment,
    FulfillmentModel,
    FulfillmentType,
} from '../Fulfillment/Fulfillment';
import {
    prop,
    Ref,
    getModelForClass,
    modelOptions,
    Severity,
    pre,
} from '@typegoose/typegoose';
import { Company } from '../Company/Company';
import { Location } from '../Location/Location';
import { createUnionType, Field, ObjectType } from 'type-graphql';
import { loaderResult } from '@src/utils/loaderResult';
import { Order } from '../Order/Order';
import { BolAppointment } from './BolAppointment';

export enum BolStatus {
    Pending = 'Pending',
    Complete = 'Complete',
    Partial = 'Partial',
}

@modelOptions({
    schemaOptions: {
        collection: 'bols',
    },
    options: {
        allowMixed: Severity.ALLOW,
    },
})
@pre<Bol>(['findOneAndUpdate'], async function () {
    const doc = await BolModel.findOne(this.getQuery());
    const fulfillments = await FulfillmentModel.find({
        bol: doc._id,
        deleted: false,
    });
    const receipts = fulfillments.filter(
        (f) => f.type === FulfillmentType.Receipt
    );
    const shipments = fulfillments.filter(
        (f) => f.type === FulfillmentType.Shipment
    );
    if (receipts.length == 0 && shipments.length == 0) {
        doc.status = BolStatus.Pending;
    } else {
        doc.status = BolStatus.Complete;
        // if any contents are shy of requested, set status to partialws
        for (const content of doc.contents) {
            let required = 0;
            const item = loaderResult(
                await ItemLoader.load(content.item.toString())
            );
            const unit = loaderResult(
                await UnitLoader.load(content.unit.toString())
            );
            if (item.unit_class == unit.class) {
                required = content.quantity * unit.base_per_unit;
            } else {
                // conversion is required
                const conversion = item.conversions.find(
                    (c) => c.from == item.unit_class && c.to == unit.class
                );

                if (!conversion)
                    throw new Error(
                        `Failed to interperet conversion from ${
                            item.unit_class
                        } to ${unit.class} for item ${item._id.toString()}`
                    );
                else
                    required =
                        content.quantity *
                        conversion.from_per_to *
                        unit.base_per_unit;
            }
            // per the required base qty of this item, check receipts for completion

            const applicableLots = await LotModel.find({
                deleted: false,
                item: content.item,
                _id: {
                    $in: receipts
                        .map((r) => r.lots)
                        .flat()
                        .map((id) => id.toString()),
                },
            });

            console.log(applicableLots);

            const totalReceivedUnits = applicableLots.reduce((acc, l) => {
                return (acc += l.start_quantity);
            }, 0);

            const fulfillment_percentage = Math.ceil(
                totalReceivedUnits / required
            );

            content.fulfillment_percentage = fulfillment_percentage;

            console.log(totalReceivedUnits);
            console.log(required);

            if (totalReceivedUnits < required) doc.status = BolStatus.Partial;

            await doc.save();
        }
    }
})
@ObjectType()
export class Bol extends Base {
    @Field(() => Itinerary)
    @prop({ required: true, ref: 'Itinerary' })
    itinerary!: Ref<Itinerary>;

    @Field({ nullable: true })
    @prop({ required: false })
    code?: string;

    @Field(() => BolStatus)
    @prop({ required: false, enum: BolStatus })
    status!: BolStatus;

    @Field(() => BolAppointment)
    @prop({ required: true })
    from!: BolAppointment;

    @Field(() => BolAppointment)
    @prop({ required: true })
    to!: BolAppointment;

    @Field(() => [BolItemContent], { nullable: true })
    @prop({ required: true, type: () => BolItemContent })
    contents!: BolItemContent[];
}

export const BolModel = getModelForClass(Bol);
export const BolLoader = getBaseLoader(BolModel);
