import { Itinerary } from './../Itinerary/Itinerary';
import { BolItemContent } from './../Content/Content';
import { LotLoader } from './../Lot/Lot';
import { Item, ItemLoader } from './../Item/Item';
import { UnitLoader } from './../Unit/Unit';
import { LocationLoader } from './../Location/Location';
import { getBaseLoader } from './../Loader';
import { Base } from './../Base/Base';
import { Fulfillment } from '../Fulfillment/Fulfillment';
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
@pre<Bol>('save', async function () {
    if (this.receipts.length == 0 && this.shipments.length == 0) {
        this.status = BolStatus.Pending;
    } else {
        this.status = BolStatus.Complete;
        // if any contents are shy of requested, set status to pending
        for (const content of this.contents) {
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
            const receiptLotIds = this.receipts
                .filter((r) => r.items && r.items.includes(content.item))
                .map((r) => r.lots);

            const applicableLots = await (
                await LotLoader.loadMany(
                    receiptLotIds.map((id) => id.toString())
                )
            )
                .map((result) => loaderResult(result))
                .filter((lot) => lot.item == content.item);

            const totalReceivedUnits = applicableLots.reduce((acc, item) => {
                return (acc += item.start_quantity);
            }, 0);

            const fulfillment_percentage = Math.ceil(
                totalReceivedUnits / required
            );

            content.fulfillment_percentage = fulfillment_percentage;

            if (totalReceivedUnits < required) this.status = BolStatus.Partial;
        }
    }
})
@ObjectType()
export class Bol extends Base {
    @Field(() => Itinerary)
    @prop({ required: true, ref: 'Itinerary' })
    itinerary!: Ref<Itinerary>;

    @Field()
    @prop({ required: true })
    code!: string;

    // denormalized, set upon save
    @Field(() => BolStatus)
    @prop({ required: false, enum: BolStatus })
    status?: BolStatus;

    @Field(() => BolAppointment)
    @prop({ required: true })
    from!: BolAppointment;

    @Field(() => BolAppointment)
    @prop({ required: true })
    to!: BolAppointment;

    @Field(() => [BolItemContent], { nullable: true })
    @prop({ required: true, type: () => BolItemContent })
    contents!: BolItemContent[];

    @Field(() => [Fulfillment])
    @prop({ required: true, type: () => Fulfillment })
    shipments!: Fulfillment[];

    @Field(() => [Fulfillment])
    @prop({ required: true, type: () => Fulfillment })
    receipts!: Fulfillment[];
}

export const BolModel = getModelForClass(Bol);
export const BolLoader = getBaseLoader(BolModel);
