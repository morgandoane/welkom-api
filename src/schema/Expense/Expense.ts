import { FulfillmentModel } from './../Fulfillment/Fulfillment';
import { BolModel } from './../Bol/Bol';
import { Itinerary, ItineraryLoader } from './../Itinerary/Itinerary';
import { getBaseLoader } from './../../utils/baseLoader';
import { Lot, LotLoader, LotModel } from './../Lot/Lot';
import { ExpenseClass } from './ExpenseClass';
import { UploadEnabled } from './../UploadEnabled/UploadEnabled';
import {
    modelOptions,
    getModelForClass,
    prop,
    Ref,
    mongoose,
} from '@typegoose/typegoose';
import { Min } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';
import { Company } from '../Company/Company';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'expenses',
    },
})
export class Expense extends UploadEnabled {
    @Min(0)
    @Field()
    @prop({ required: true, min: 0 })
    amount!: number;

    @Field(() => Company)
    @prop({ required: true, ref: () => Company })
    customer!: Ref<Company>;

    @Field(() => Company)
    @prop({ required: true, ref: () => Company })
    vendor!: Ref<Company>;

    @Field(() => ExpenseClass)
    @prop({ required: true, enum: ExpenseClass })
    expense_class!: ExpenseClass;

    @Field(() => String)
    @prop({ required: true, type: mongoose.Types.ObjectId })
    against!: Ref<Lot | Itinerary>;
}

export const ExpenseModel = getModelForClass(Expense);
export const ExpenseLoader = getBaseLoader(ExpenseModel);

const clearCachedLotExpenses = async (
    _id: mongoose.Types.ObjectId | string | Ref<Lot | Itinerary>,
    visited: Record<string, true>
) => {
    if (!visited[_id.toString()]) {
        visited[_id.toString()] = true;
        LotLoader.clear(_id);
        await LotModel.findByIdAndUpdate(_id, {
            expense_summaries: null,
        });

        const decendents = await LotModel.find({
            ['contents.lot']: _id,
        });

        for (const child of decendents) {
            await clearCachedLotExpenses(child._id, visited);
        }
    }
};

const clearCachedItineraryExpenses = async (
    _id: mongoose.Types.ObjectId | string | Ref<Lot | Itinerary>
) => {
    ItineraryLoader.clear(_id);

    const bols = await BolModel.find({ itinerary: _id });
    const fulfillments = await FulfillmentModel.find({
        bol: { $in: bols.map((b) => b._id) },
    });

    const decendents = await LotModel.find({
        _id: {
            $in: fulfillments.map((f) => f.contents.map((c) => c.lot).flat()),
        },
    });

    for (const child of decendents) {
        await clearCachedLotExpenses(child._id, {});
    }
};

export const ExpenseModifier: Record<
    ExpenseClass,
    (
        _id: mongoose.Types.ObjectId | string | Ref<Lot | Itinerary>
    ) => Promise<void>
> = {
    [ExpenseClass.Itinerary]: async (id) =>
        await clearCachedItineraryExpenses(id),
    [ExpenseClass.Lot]: async (id) => await clearCachedLotExpenses(id, {}),
};
