import { OrderQueuePreference } from './../UserPreference/categories/OrderQueuePreference';
import { UserPreference } from './../UserPreference/UserPreference';
import { OrderQueueInput } from './OrderQueueInput';
import { ItineraryModel } from '@src/schema/Itinerary/Itinerary';
import { BolModel } from './../Bol/Bol';
import { OrderModel } from './../Order/Order';
import { UserInputError } from 'apollo-server-core';
import { Permitted } from '@src/auth/middleware/Permitted';
import { OrderQueue, OrderQueueModel } from './OrderQueue';
import {
    Arg,
    Ctx,
    Query,
    Resolver,
    UseMiddleware,
    Mutation,
} from 'type-graphql';
import { createBaseResolver } from './../Base/BaseResolvers';
import { Permission } from '@src/auth/permissions';
import { Context } from '@src/auth/context';

const BaseResolvers = createBaseResolver();

@Resolver(() => OrderQueue)
export class OrderQueueResolvers extends BaseResolvers {
    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.CreateOrderQueue,
        })
    )
    @Query(() => OrderQueue)
    async orderQueue(@Ctx() context: Context): Promise<OrderQueue> {
        const doc = await OrderQueueModel.findOne({
            created_by: context.base.created_by,
        });

        if (doc) return doc.toJSON() as unknown as OrderQueue;

        const newQueue: OrderQueue = {
            ...context.base,
            lines: [],
        };

        const res = await OrderQueueModel.create(newQueue);

        return res.toJSON() as unknown as OrderQueue;
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.CreateOrder,
        })
    )
    @Mutation(() => OrderQueue)
    async updateOrderQueue(
        @Ctx() context: Context,
        @Arg('data', () => OrderQueueInput) data: OrderQueueInput
    ): Promise<OrderQueue> {
        let doc;
        const existing = await OrderQueueModel.findOne({
            created_by: context.base.created_by,
        });

        if (!existing) {
            const newDoc: OrderQueue = {
                ...context.base,
                lines: [],
            };

            const res = await OrderQueueModel.create(newDoc);
            doc = res;
        } else {
            doc = existing;
        }

        doc.lines = await Promise.all(
            data.lines.map((line) => line.validateOrderQueueLineInput())
        );

        await doc.save();

        const currentPreferences = await UserPreference.getForUser(context);
        const newQueuePref: OrderQueuePreference =
            currentPreferences.orderQueue || { items: [] };
        for (const line of doc.lines) {
            if (
                line.item &&
                line.unit &&
                line.vendor &&
                line.quantity &&
                line.destination
            ) {
                const index = newQueuePref.items
                    .map((i) => i.item.toString())
                    .indexOf(line.item.toString());

                if (index == -1) {
                    newQueuePref.items.push({
                        item: line.item,
                        tally: 1,
                        vendor: line.vendor,
                        quantity: line.quantity,
                        unit: line.unit,
                        time: line.time,
                        destination: line.destination,
                    });
                } else {
                    newQueuePref.items[index] = {
                        item: line.item,
                        tally: newQueuePref.items[index].tally + 1,
                        vendor: line.vendor,
                        quantity: line.quantity,
                        unit: line.unit,
                        time: line.time,
                        destination: line.destination,
                    };
                }
            }
        }

        await UserPreference.setPreferences(context, {
            orderQueue: newQueuePref,
        });

        return doc.toJSON() as unknown as OrderQueue;
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.CreateOrder,
        })
    )
    @Mutation(() => Boolean)
    async processOrderQueue(@Ctx() context: Context): Promise<boolean> {
        const doc = await OrderQueueModel.findOne({
            created_by: context.base.created_by,
        });

        if (!doc)
            throw new UserInputError('No order queue exists for this user.');

        const data = await Promise.all(
            doc.lines.map((line) => line.processQueueLine(context))
        );

        for (const { order, bols, itineraries } of data) {
            await OrderModel.create(order);
            await ItineraryModel.create(itineraries);
            await BolModel.create(bols);
        }

        await OrderQueueModel.deleteMany({
            created_by: context.base.created_by,
        });

        return true;
    }
}
