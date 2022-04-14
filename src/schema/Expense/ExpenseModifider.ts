import { mongoose, Ref } from '@typegoose/typegoose';
import { BolModel } from '../Bol/BolModel';
import { FulfillmentModel } from '../Fulfillment/Fulfillment';
import { Itinerary, ItineraryLoader } from '../Itinerary/Itinerary';
import { Lot, LotLoader, LotModel } from '../Lot/Lot';
import { ExpenseClass } from './ExpenseClass';

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
