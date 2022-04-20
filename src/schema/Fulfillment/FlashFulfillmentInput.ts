import { Context } from '@src/auth/context';
import {
    CodeGenerator,
    CodeType,
} from '@src/services/CodeGeneration/CodeGeneration';
import { loaderResult } from '@src/utils/loaderResult';
import { mongoose } from '@typegoose/typegoose';
import { ObjectId } from 'mongoose';
import { Field, InputType } from 'type-graphql';
import { Bol, BolModel, BolStatus } from '../Bol/Bol';
import { CompanyLoader } from '../Company/Company';
import { Item, ItemModel } from '../Item/Item';
import { Itinerary, ItineraryModel } from '../Itinerary/Itinerary';
import { LocationLoader } from '../Location/Location';
import { Lot, LotLoader, LotModel } from '../Lot/Lot';
import { LotFinder } from '../Lot/LotFinder';
import { ObjectIdScalar } from '../ObjectIdScalar';
import { UnitLoader } from '../Unit/Unit';
import { Fulfillment, FulfillmentModel, FulfillmentType } from './Fulfillment';
import { FulfillmentLotFinder } from './FulfillmentInput';

@InputType()
export class FlashFulfillmentLine {
    @Field()
    item_name!: string;

    @Field()
    quantity!: number;

    @Field(() => ObjectIdScalar)
    unit!: ObjectId;

    @Field(() => [String])
    lot_numbers!: string[];
}

@InputType()
export class FlashFulfillmentInput {
    @Field(() => ObjectIdScalar)
    vendor: ObjectId;

    @Field(() => ObjectIdScalar)
    customer: ObjectId;

    @Field(() => ObjectIdScalar)
    location: ObjectId;

    @Field()
    date: Date;

    @Field(() => [FlashFulfillmentLine])
    items!: FlashFulfillmentLine[];

    public async validateFlashFulfillment(context: Context): Promise<{
        itinerary: Itinerary;
        bol: Bol;
        fulfillment: Fulfillment;
    }> {
        const itinerary: Itinerary = {
            ...context.base,
            code: await CodeGenerator.generate(CodeType.ITIN),
            orders: [],
        };

        const bol: Bol = {
            ...context.base,
            itinerary: itinerary._id,
            status: BolStatus.Complete,
            from: {
                ...context.base._id,
                company: this.vendor,
                date: this.date,
                time_sensitive: false,
            },
            to: {
                ...context.base._id,
                company: this.customer,
                date: this.date,
                time_sensitive: false,
            },
            contents: [],
        };

        const fulfillment: Fulfillment = {
            ...context.base,
            bol: bol._id,
            lots: [],
            type: FulfillmentType.Receipt,
            location: this.location,
            company: this.customer,
        };

        const location = loaderResult(
            await LocationLoader.load(this.location.toString())
        );

        const company = loaderResult(
            await CompanyLoader.load(this.customer.toString())
        );

        const vendor = loaderResult(
            await CompanyLoader.load(this.vendor.toString())
        );

        for (const line of this.items) {
            const lotUnit = loaderResult(
                await UnitLoader.load(line.unit.toString())
            );

            const exisitingItem = await ItemModel.findOne({
                name: line.item_name,
            });

            const newItem: Item = exisitingItem
                ? null
                : {
                      ...context.base,
                      english: line.item_name,
                      spanish: line.item_name,
                      unit_class: lotUnit.class,
                      to_base_unit: 1,
                      conversions: [],
                  };

            const itemRes = newItem ? await ItemModel.create(newItem) : null;

            const fulfillmentLot: Lot = {
                ...context.base,
                code: await CodeGenerator.generate(CodeType.LOT),
                start_quantity: line.quantity * lotUnit.base_per_unit,
                item: itemRes ? itemRes._id : exisitingItem._id,
                quality_check_responses: [],
                contents: [],
                company: company._id,
                location: location._id,
            };

            for (const code of line.lot_numbers) {
                const lotFinder = new FulfillmentLotFinder();
                lotFinder.code = code;
                lotFinder.quantity = line.quantity / this.items.length;
                lotFinder.unit = line.unit.toString();
                lotFinder.company = vendor._id as unknown as ObjectId;

                const inboundLot = await lotFinder.execute(
                    context,
                    itemRes ? itemRes._id : exisitingItem._id
                );

                fulfillmentLot.contents.push({
                    lot: inboundLot._id as unknown as ObjectId,
                    quantity: line.quantity / this.items.length,
                    unit: line.unit,
                });
            }

            const lotRes = await LotModel.create(fulfillmentLot);
            fulfillment.lots.push(lotRes._id);
        }

        return { itinerary, bol, fulfillment };
    }
}

@InputType()
export class UpdateFlashFulfillmentInput {
    @Field(() => ObjectIdScalar)
    vendor: ObjectId;

    @Field(() => ObjectIdScalar)
    customer: ObjectId;

    @Field(() => ObjectIdScalar)
    location: ObjectId;

    @Field()
    date: Date;

    @Field(() => [FlashFulfillmentLine])
    items!: FlashFulfillmentLine[];

    public async validateFlashFulfillmentUpdate(
        context: Context,
        fulfillment_id: ObjectId
    ): Promise<{
        itinerary_update: { _id: mongoose.Types.ObjectId; doc: Itinerary };
        bol_update: { _id: mongoose.Types.ObjectId; doc: Bol };
        fulfillment_update: { _id: mongoose.Types.ObjectId; doc: Fulfillment };
    }> {
        const fulfillment = await FulfillmentModel.findById(fulfillment_id);
        const bol = await BolModel.findById(fulfillment.bol);
        const itinerary = await ItineraryModel.findById(bol.itinerary);

        itinerary.carrier = this.vendor;

        bol.from.company = this.vendor;
        bol.to.company = this.customer;
        bol.to.location = this.location;
        bol.to.date = this.date;

        fulfillment.lots = [];
        fulfillment.location = this.location;
        fulfillment.company = this.customer;

        const location = loaderResult(
            await LocationLoader.load(this.location.toString())
        );

        const company = loaderResult(
            await CompanyLoader.load(this.customer.toString())
        );

        const vendor = loaderResult(
            await CompanyLoader.load(this.vendor.toString())
        );

        for (const line of this.items) {
            const lotUnit = loaderResult(
                await UnitLoader.load(line.unit.toString())
            );

            const exisitingItem = await ItemModel.findOne({
                name: line.item_name,
            });

            const newItem: Item = exisitingItem
                ? null
                : {
                      ...context.base,
                      english: line.item_name,
                      spanish: line.item_name,
                      unit_class: lotUnit.class,
                      to_base_unit: 1,
                      conversions: [],
                  };

            const itemRes = newItem ? await ItemModel.create(newItem) : null;

            const fulfillmentLot: Lot = {
                ...context.base,
                code: await CodeGenerator.generate(CodeType.LOT),
                start_quantity: line.quantity * lotUnit.base_per_unit,
                item: itemRes ? itemRes._id : exisitingItem._id,
                quality_check_responses: [],
                contents: [],
                company: company._id,
                location: location._id,
            };

            for (const code of line.lot_numbers) {
                const lotFinder = new FulfillmentLotFinder();
                lotFinder.code = code;
                lotFinder.quantity = line.quantity / this.items.length;
                lotFinder.unit = line.unit.toString();
                lotFinder.company = vendor._id as unknown as ObjectId;

                const inboundLot = await lotFinder.execute(
                    context,
                    itemRes ? itemRes._id : exisitingItem._id
                );

                fulfillmentLot.contents.push({
                    lot: inboundLot._id as unknown as ObjectId,
                    quantity: line.quantity / this.items.length,
                    unit: line.unit,
                });
            }

            const lotRes = await LotModel.create(fulfillmentLot);
            fulfillment.lots.push(lotRes._id);
        }

        return {
            itinerary_update: { doc: itinerary, _id: itinerary._id },
            bol_update: { doc: bol, _id: bol._id },
            fulfillment_update: { doc: fulfillment, _id: fulfillment._id },
        };
    }
}
