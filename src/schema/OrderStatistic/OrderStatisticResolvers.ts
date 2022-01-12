import { CompanyLoader } from './../Company/Company';
import { LocationModel } from './../Location/Location';
import { loaderResult } from './../../utils/loaderResult';
import { UnitClass, UnitLoader } from './../Unit/Unit';
import { OrderModel } from './../Order/Order';
import { Item, ItemModel, ItemLoader } from './../Item/Item';
import { OrderStatisticFilter } from './OrderStatisticsFilter';
import { Permitted } from '@src/auth/middleware/Permitted';
import {
    OrderStatistic,
    OrderStatisticRange,
    OrderStatisticRangeQuantity,
} from './OrderStatistic';
import { Arg, Query, Resolver, UseMiddleware } from 'type-graphql';
import { UserRole } from '@src/auth/UserRole';
import {
    addYears,
    endOfDay,
    endOfYear,
    startOfDay,
    startOfYear,
} from 'date-fns';
import { Ref } from '@typegoose/typegoose';
import { Unit } from '../Unit/Unit';
import { Company } from '../Company/Company';

export interface OrderStatisticResult {
    month: number;
    contents: {
        vendor: Ref<Company>;
        unit: Ref<Unit>;
        quantity: number;
        destination: Ref<Location>;
        item: Ref<Item>;
    }[];
}

@Resolver(() => OrderStatistic)
export class OrderStatisticResolvers {
    @UseMiddleware(Permitted({ type: 'role', role: UserRole.Manager }))
    @Query(() => [OrderStatistic])
    async orderStatistics(
        @Arg('filter', () => OrderStatisticFilter)
        filter: OrderStatisticFilter
    ): Promise<OrderStatistic[]> {
        const results: OrderStatisticResult[] = await OrderModel.aggregate([
            [
                {
                    $match: await filter.serializeFilter(),
                },
                {
                    $unwind: {
                        path: '$contents',
                        preserveNullAndEmptyArrays: false,
                    },
                },
                {
                    $project: {
                        date: '$contents.due',
                        unit: '$contents.unit',
                        quantity: '$contents.quantity',
                        location: '$contents.location',
                        item: '$contents.item',
                        vendor: '$vendor',
                    },
                },
                {
                    $group: {
                        _id: {
                            $month: '$date',
                        },
                        month_contents: {
                            $addToSet: {
                                quantity: '$quantity',
                                destination: '$location',
                                item: '$item',
                                vendor: '$vendor',
                                unit: '$unit',
                            },
                        },
                    },
                },
                {
                    $project: {
                        month: '$_id',
                        contents: '$month_contents',
                        _id: 0,
                    },
                },
            ],
        ]);

        const groupedByItem: Record<
            string,
            {
                month: number;
                vendor: Ref<Company>;
                unit: Ref<Unit>;
                quantity: number;
                destination: Ref<Location>;
            }[]
        > = {};

        for (const { month, contents } of results) {
            for (const {
                vendor,
                unit,
                quantity,
                destination,
                item,
            } of contents) {
                const record: typeof groupedByItem[string][number] = {
                    month,
                    vendor,
                    unit,
                    quantity,
                    destination,
                };

                if (groupedByItem[item.toString()]) {
                    groupedByItem[item.toString()].push(record);
                } else {
                    groupedByItem[item.toString()] = [record];
                }
            }
        }

        const stats: OrderStatistic[] = [];

        for (const itemId of Object.keys(groupedByItem)) {
            const item = loaderResult(await ItemLoader.load(itemId));
            const ranges: OrderStatisticRange[] = [];

            for (const {
                month,
                vendor,
                unit,
                quantity,
                destination,
            } of groupedByItem[itemId]) {
                const qtys: OrderStatisticRangeQuantity[] = [];

                const unitDoc = loaderResult(
                    await UnitLoader.load(unit.toString())
                );

                const qty = unitDoc.base_per_unit * quantity;
                const unit_class = unitDoc.class;

                const qtyIndex = qtys
                    .map((q) => q.unit_class)
                    .indexOf(unit_class);

                if (qtyIndex == -1) {
                    qtys.push({ quantity: qty, unit_class });
                } else {
                    qtys[qtyIndex].quantity = qtys[qtyIndex].quantity + qty;
                }

                const rangeIndex = ranges.map((r) => r.month).indexOf(month);

                if (rangeIndex == -1) {
                    ranges.push({
                        month,
                        quantitys: [...qtys],
                    });
                } else {
                    ranges[rangeIndex].quantitys = [
                        ...ranges[rangeIndex].quantitys,
                        ...qtys,
                    ];
                }
            }

            stats.push({ item, ranges });
        }

        return stats;
    }
}
