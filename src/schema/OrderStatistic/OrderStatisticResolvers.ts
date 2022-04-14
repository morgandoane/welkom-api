import { loaderResult } from './../../utils/loaderResult';
import { UnitLoader } from './../Unit/Unit';
import { OrderModel } from './../Order/Order';
import { Item, ItemLoader } from './../Item/Item';
import { OrderStatisticFilter } from './OrderStatisticsFilter';
import { Permitted } from '@src/auth/middleware/Permitted';
import { OrderStatistic, OrderStatisticRange } from './OrderStatistic';
import { Arg, Query, Resolver, UseMiddleware } from 'type-graphql';
import { UserRole } from '@src/auth/UserRole';
import { Ref } from '@typegoose/typegoose';
import { Unit } from '../Unit/Unit';
import { Company } from '../Company/Company';
import { getMonth } from 'date-fns';

export interface OrderStatisticResult {
    _id: string;
    orders: {
        vendor: Ref<Company>;
        customer: Ref<Company>;
        unit: Ref<Unit>;
        quantity: number;
        destination: Ref<Location>;
        date: Date;
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
        const stats: OrderStatistic[] = [];

        const groupedByItem: OrderStatisticResult[] =
            await OrderModel.aggregate([
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
                        unit: '$contents.unit',
                        quantity: '$contents.quantity',
                        item: '$contents.item',
                        date: '$contents.due',
                        vendor: '$vendor',
                        customer: '$customer',
                        destination: '$contents.destination',
                    },
                },
                {
                    $group: {
                        _id: '$item',
                        orders: {
                            $addToSet: {
                                unit: '$unit',
                                quantity: '$quantity',
                                date: '$date',
                                vendor: '$vendor',
                                customer: '$customer',
                                destination: '$location',
                            },
                        },
                    },
                },
            ]);

        for (const { _id: item_id, orders } of groupedByItem) {
            const item = loaderResult(
                await ItemLoader.load(item_id.toString())
            );

            const stat: OrderStatistic = { item, ranges: [] };

            const groups: Record<string, OrderStatisticRange> = {};

            for (const {
                vendor,
                customer,
                unit: unit_id,
                quantity,
                destination,
                date,
            } of orders) {
                const month = getMonth(date);

                const { class: unit_class, base_per_unit } = loaderResult(
                    await UnitLoader.load(unit_id.toString())
                );

                if (groups[month] !== undefined) {
                    const index = groups[month].quantitys
                        .map((q) => q.unit_class)
                        .indexOf(unit_class);

                    if (index == -1) {
                        groups[month].quantitys.push({
                            quantity: base_per_unit * quantity,
                            unit_class,
                        });
                    } else {
                        groups[month].quantitys[index] = {
                            ...groups[month].quantitys[index],
                            quantity:
                                groups[month].quantitys[index].quantity +
                                quantity * base_per_unit,
                        };
                    }
                } else {
                    groups[month] = {
                        month,
                        quantitys: [
                            { unit_class, quantity: base_per_unit * quantity },
                        ],
                    };
                }
            }

            for (const val of Object.values(groups)) {
                stat.ranges.push(val);
            }

            stats.push(stat);
        }
        return stats;
    }
}
