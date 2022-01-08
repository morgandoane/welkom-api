import { UserInputError } from 'apollo-server-errors';
import { UnitLoader } from './../Unit/Unit';
import { LotContent } from '@src/schema/Content/Content';
import {
    CodeGenerator,
    CodeType,
} from './../../services/CodeGeneration/CodeGeneration';
import { LotModel } from './../Lot/Lot';
import { Item, ItemLoader } from './../Item/Item';
import { CompanyLoader } from './../Company/Company';
import { mongoose, DocumentType, Ref } from '@typegoose/typegoose';
import { LocationLoader } from './../Location/Location';
import { loaderResult } from './../../utils/loaderResult';
import { Context } from './../../auth/context';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { ObjectId } from 'mongoose';
import { Field, InputType } from 'type-graphql';
import { Fulfillment, FulfillmentType } from './Fulfillment';
import { Lot } from '../Lot/Lot';
import { QualityCheckResponseInput } from '../QualityCheckResponse/QualityCheckResponseInput';

@InputType()
export class FulfillmentItemInput {
    @Field(() => ObjectIdScalar)
    item: ObjectId;

    @Field(() => [FulfillmentLotFinder])
    lots!: FulfillmentLotFinder[];

    @Field(() => [QualityCheckResponseInput])
    quality_check_responses!: QualityCheckResponseInput[];
}

@InputType()
export class FulfillmentInput {
    @Field(() => ObjectIdScalar)
    bol!: ObjectId;

    @Field(() => String, { nullable: true })
    bol_code_override?: string;

    @Field(() => [FulfillmentItemInput])
    items!: FulfillmentItemInput[];

    @Field(() => FulfillmentType)
    type!: FulfillmentType;

    @Field(() => ObjectIdScalar)
    location!: ObjectId;

    @Field(() => ObjectIdScalar)
    company!: ObjectId;

    public async validateFulfillment(context: Context): Promise<Fulfillment> {
        loaderResult(await LocationLoader.load(this.location.toString()));
        loaderResult(await CompanyLoader.load(this.company.toString()));

        const fulfillment: Fulfillment = {
            ...context.base,
            bol: new mongoose.Types.ObjectId(this.bol.toString()),
            type: this.type,
            location: new mongoose.Types.ObjectId(this.location.toString()),
            company: new mongoose.Types.ObjectId(this.company.toString()),
            lots: [],
        };

        for (const { item: item_id, lots, quality_check_responses } of this
            .items) {
            const item = await loaderResult(
                ItemLoader.load(item_id.toString())
            );

            let start_quantity = 0;

            const qtys = lots.map(({ quantity, unit }) => ({ quantity, unit }));
            console.log(qtys);

            for (const { quantity, unit: unit_id } of qtys) {
                // We need to understand this unit in the UnitClass of the lot's item
                const unit = loaderResult(
                    await UnitLoader.load(unit_id.toString())
                );

                if (unit.class === item.unit_class) {
                    // no conversion necessary
                    start_quantity += quantity * unit.base_per_unit;
                } else {
                    // conversion is necessary
                    const conversion = item.conversions.find(
                        ({ from, to }) =>
                            from === item.unit_class && to === unit.class
                    );

                    if (!conversion) {
                        throw new UserInputError(
                            `Failed to interperet conversion from ${
                                item.unit_class
                            } to ${
                                unit.class
                            } for item with id ${item._id.toString()}`
                        );
                    } else {
                        start_quantity +=
                            quantity *
                            conversion.from_per_to *
                            unit.base_per_unit;
                    }
                }
            }

            const fulfillmentLot: Lot = {
                ...context.base,
                code: await CodeGenerator.generate(CodeType.LOT),
                quality_check_responses: [],
                contents: [],
                start_quantity,
                item: item._id,
            };

            for (const lotfinder of lots) {
                const lot = await lotfinder.execute(context, item._id);
                const unit = loaderResult(
                    await UnitLoader.load(lotfinder.unit)
                );
                fulfillmentLot.contents.push({
                    lot: lot._id,
                    quantity: lotfinder.quantity,
                    unit: unit._id,
                });
            }

            for (const check of quality_check_responses) {
                fulfillmentLot.quality_check_responses.push(
                    await check.validateResponse(context)
                );
            }

            const fulfillmentLotRes = await LotModel.create(fulfillmentLot);

            fulfillment.lots.push(fulfillmentLotRes._id);
        }

        return fulfillment;
    }
}

@InputType()
export class UpdateFulfillmentInput extends FulfillmentInput {
    @Field({ nullable: true })
    deleted?: boolean;

    public async validateFulfillmentUpdate(
        context: Context
    ): Promise<Fulfillment> {
        const doc = await this.validateFulfillment(context);

        if (this.deleted !== undefined && this.deleted !== null) {
            doc.deleted = this.deleted;
        }

        return doc;
    }
}

@InputType()
export class FulfillmentLotFinder {
    @Field()
    code: string;

    @Field()
    quantity: number;

    @Field()
    unit: string;

    @Field(() => ObjectIdScalar)
    company: ObjectId;

    @Field(() => ObjectIdScalar, { nullable: true })
    location?: ObjectId;

    public async execute(
        context: Context,
        item_id: Ref<Item> | string
    ): Promise<DocumentType<Lot>> {
        const company = loaderResult(
            await CompanyLoader.load(this.company.toString())
        );
        const item = loaderResult(await ItemLoader.load(item_id.toString()));
        const location = !this.location
            ? undefined
            : loaderResult(await LocationLoader.load(this.location.toString()));

        const match = await LotModel.findOne({
            item: item._id.toString(),
            company: company._id,
            location: location ? location._id : undefined,
            code: this.code,
        });

        if (match) return match;
        else {
            const newLot: Lot = {
                ...context.base,
                quality_check_responses: [],
                code: this.code,
                item: item._id,
                company: company._id,
                contents: [],
                start_quantity: 0,
            };

            const res = await LotModel.create(newLot);

            return res;
        }
    }
}
