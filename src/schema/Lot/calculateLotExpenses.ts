import { loaderResult } from '@src/utils/loaderResult';
import { mongoose } from '@typegoose/typegoose';
import { BolLoader } from '../Bol/BolModel';
import { ExpenseModel } from '../Expense/Expense';
import { ExpenseClass } from '../Expense/ExpenseClass';
import { ExpenseSummary } from '../ExpenseSummary/ExpenseSummary';
import { FulfillmentModel } from '../Fulfillment/Fulfillment';
import { Lot, LotLoader } from './Lot';
import { DocumentType } from '@typegoose/typegoose';

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
                    const palletCount = content.quantity / content.per_pallet;

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
