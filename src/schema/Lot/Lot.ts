import { ProductionLine } from './../ProductionLine/ProductionLine';
import { BolLoader } from './../Bol/Bol';
import { FulfillmentModel } from './../Fulfillment/Fulfillment';
import { ExpenseSummary } from './../ExpenseSummary/ExpenseSummary';
import { loaderResult } from './../../utils/loaderResult';
import { Company } from '@src/schema/Company/Company';
import { ExpenseModel } from './../Expense/Expense';
import { Expensed } from './../Expensed/Expensed';
import {
    modelOptions,
    getModelForClass,
    prop,
    Ref,
    index,
    DocumentType,
} from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { Item } from '../Item/Item';
import { Min } from 'class-validator';
import { BaseUnit } from '../Unit/BaseUnit';
import { LotContent } from '../LotContent/LotContent';
import { getBaseLoader } from '@src/utils/baseLoader';
import { ExpenseClass } from '../Expense/ExpenseClass';
import mongoose from 'mongoose';
import { Location } from '../Location/Location';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'lots',
    },
})
// any given company cannot produce two lots of the same item with the same code.
@index({ company: 1, item: 1, code: 1 }, { unique: true })
export class Lot extends Expensed {
    @Field()
    @prop({ required: true })
    code!: string;

    @Field(() => Item)
    @prop({ required: true, ref: () => Item })
    item!: Ref<Item>;

    @Field(() => ProductionLine, { nullable: true })
    @prop({ required: false, ref: () => ProductionLine })
    production_line!: Ref<ProductionLine> | null;

    @Field(() => Company)
    @prop({ required: true, ref: () => Company })
    company!: Ref<Company>;

    @Field(() => Location, { nullable: true })
    @prop({ required: false, ref: () => Location })
    location!: Ref<Location> | null;

    @Field(() => [LotContent])
    @prop({ required: true, type: () => LotContent })
    contents!: LotContent[];

    @Min(0)
    @Field()
    @prop({ required: true, min: 0 })
    quantity!: number;

    // must match the BaseUnit of the item
    @Field(() => BaseUnit)
    @prop({ required: true, enum: BaseUnit })
    base_unit!: BaseUnit;

    @Field(() => [ExpenseSummary])
    @prop({ required: false, type: () => ExpenseSummary })
    expense_summaries!: ExpenseSummary[] | null;
}

export const LotModel = getModelForClass(Lot);
export const LotLoader = getBaseLoader(LotModel);

export const calculateLotExpenses = async (
    lot: DocumentType<Lot>
): Promise<ExpenseSummary[]> => {
    // expenses per lot are determined by
    // A) the expenses assigned specifically to this lot
    // B) any fulfillment expenses that involve this lot, multipled by (pallets per lot / total pallets on truck)
    // C) the expenses of the direct ancestral lots, multiplied by the amount included in the child lot

    if (lot.expense_summaries !== null) return lot.expense_summaries;

    const keyedByCustomer: Record<string, ExpenseSummary[]> = {};

    // A) --------------------------------------------------------------------
    const lotExpenses = await ExpenseModel.find({
        deleted: false,
        expense_class: ExpenseClass.Lot,
        target: lot._id,
    });

    for (const expense of lotExpenses) {
        const summary = {
            total_amount: expense.amount,
            customer: expense.customer,
            holdup: null,
        };
        if (expense.customer.toString() in keyedByCustomer) {
            keyedByCustomer[expense.customer.toString()].push(summary);
        } else {
            keyedByCustomer[expense.customer.toString()] = [summary];
        }
    }

    // B) --------------------------------------------------------------------
    for (const content of lot.contents) {
        const parentLot = loaderResult(
            await LotLoader.load(content.lot.toString())
        );
        const parentExpenseSummaries = await calculateLotExpenses(parentLot);
        for (const {
            total_amount,
            customer,
            holdup,
        } of parentExpenseSummaries) {
            if (holdup || total_amount == null) {
                if (customer.toString() in keyedByCustomer) {
                    keyedByCustomer[customer.toString()].push({
                        total_amount: null,
                        customer,
                        holdup:
                            holdup ||
                            `Failed to interpret expenses for lot with id ${parentLot._id.toString()}`,
                    });
                } else {
                    keyedByCustomer[customer.toString()] = [
                        {
                            total_amount: null,
                            customer,
                            holdup:
                                holdup ||
                                `Failed to interpret expenses for lot with id ${parentLot._id.toString()}`,
                        },
                    ];
                }
            } else {
                // convert expense summary base on "edge weight"
                if (parentLot.base_unit == content.base_unit) {
                    // no conversion required
                    const total =
                        total_amount * (content.quantity / parentLot.quantity);
                    if (customer.toString() in keyedByCustomer) {
                        keyedByCustomer[customer.toString()].push({
                            total_amount: total,
                            customer,
                            holdup: holdup || '',
                        });
                    } else {
                        keyedByCustomer[customer.toString()] = [
                            {
                                total_amount: total,
                                customer,
                                holdup: holdup || '',
                            },
                        ];
                    }
                } else {
                    // conversion required, failed to interpret
                    if (customer.toString() in keyedByCustomer) {
                        keyedByCustomer[customer.toString()].push({
                            total_amount: null,
                            customer,
                            holdup:
                                holdup ||
                                `Failed to perform expense conversion for lot with id ${parentLot._id.toString()}`,
                        });
                    } else {
                        keyedByCustomer[customer.toString()] = [
                            {
                                total_amount: null,
                                customer,
                                holdup:
                                    holdup ||
                                    `Failed to perform expense conversion for lot with id ${parentLot._id.toString()}`,
                            },
                        ];
                    }
                }
            }
        }
    }

    // C) --------------------------------------------------------------------
    const fulfillments = await FulfillmentModel.find({
        ['contents.lot']: lot._id,
    });

    if (fulfillments.length > 0) {
        for (const fulfillment of fulfillments) {
            const bol = loaderResult(
                await BolLoader.load(fulfillment.bol.toString())
            );

            const itineraryExpenses = await ExpenseModel.find({
                deleted: false,
                expense_class: ExpenseClass.Itinerary,
                target: bol.itinerary,
            });

            if (itineraryExpenses.length > 0) {
                // base off the fulfillment content's pallet configurations, determine how to divide up the itinerary cost

                // Record<lot_id, pallet_count>
                const lotPalletCounts: Record<string, number> = {};

                for (const content of fulfillment.contents) {
                    const palletCount =
                        content.quantity /
                        content.pallet_configuration.capacity;

                    if (content.lot.toString() in lotPalletCounts) {
                        lotPalletCounts[content.lot.toString()] += palletCount;
                    } else {
                        lotPalletCounts[content.lot.toString()] = palletCount;
                    }
                }

                const totalPallets = Object.values(lotPalletCounts).reduce(
                    (stack, count) => stack + count,
                    0
                );

                for (const lot_id of Object.keys(lotPalletCounts)) {
                    if (lot_id == lot._id.toString()) {
                        // expense applies to this* lot
                        const multiplier =
                            lotPalletCounts[lot_id] / totalPallets;

                        for (const { amount, customer } of itineraryExpenses) {
                            if (customer.toString() in keyedByCustomer) {
                                keyedByCustomer[customer.toString()].push({
                                    total_amount: amount * multiplier,
                                    holdup: null,
                                    customer,
                                });
                            } else {
                                keyedByCustomer[customer.toString()] = [
                                    {
                                        total_amount: amount * multiplier,
                                        holdup: null,
                                        customer,
                                    },
                                ];
                            }
                        }
                    }
                }
            }
        }
    }

    // Finally, "flatten" the expenses by customer
    const res: ExpenseSummary[] = Object.keys(keyedByCustomer).map(
        (customerKey) => {
            const filtered = keyedByCustomer[customerKey];
            return {
                customer: new mongoose.Types.ObjectId(customerKey),
                total_amount: filtered.reduce((stack, summary) => {
                    if (stack === null || summary.total_amount == null)
                        return null;
                    else return stack + summary.total_amount;
                }, 0 as null | number),
                holdup: filtered.reduce((stack, summary) => {
                    if (stack !== null || summary.holdup !== null)
                        return stack || summary.holdup;
                    else return null;
                }, null as string | string),
            };
        }
    );

    lot.expense_summaries = res;

    await lot.save();

    return res;
};
