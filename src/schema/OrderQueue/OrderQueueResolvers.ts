import { ItemModel } from './../Item/Item';
import { mongoose } from '@typegoose/typegoose';
import { Context } from '@src/auth/context';
import { OrderQueueContentInput } from './OrderQueueInput';
import {
    OrderQueue,
    PersonalOrderQueueModel,
    OrderQueueRecord,
    OrderQueueRecordModel,
    OrderQueueTemplate,
    OrderQueueTemplateModel,
} from './OrderQueue';
import {
    Arg,
    Mutation,
    Resolver,
    Ctx,
    Query,
    UseMiddleware,
} from 'type-graphql';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';

@Resolver(() => OrderQueue)
export class OrderQueueResolvers {
    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.CreateOrderQueue,
        })
    )
    @Query(() => OrderQueue, { nullable: true })
    async orderQueue(@Ctx() { base }: Context): Promise<OrderQueue> {
        const match = await PersonalOrderQueueModel.find({
            author: base.created_by,
        });

        if (match[0]) return match[0].toJSON() as unknown as OrderQueue;
        else return null;
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.UpdateOrderQueue,
        })
    )
    @Mutation(() => OrderQueue)
    async updateOrderQueue(
        @Ctx() { base }: Context,
        @Arg('contents', () => [OrderQueueContentInput])
        contents: OrderQueueContentInput[]
    ): Promise<OrderQueue> {
        const newContents = [];

        for (const content of contents) {
            newContents.push(await content.serialize());
        }

        const existingQueues = await PersonalOrderQueueModel.find({
            author: base.created_by,
        });

        if (existingQueues[0]) {
            const res = await PersonalOrderQueueModel.findByIdAndUpdate(
                existingQueues[0]._id,
                { contents: newContents },
                { new: true }
            );

            return res.toJSON() as unknown as OrderQueue;
        } else {
            const newQueue: OrderQueue = {
                _id: new mongoose.Types.ObjectId(),
                author: base.created_by,
                contents: newContents,
            };

            const doc = await PersonalOrderQueueModel.create(newQueue);
            return doc.toJSON() as unknown as OrderQueue;
        }
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.CreateOrderQueue,
        })
    )
    @Mutation(() => OrderQueue)
    async processOrderQueue(
        @Ctx() { base }: Context,
        @Arg('contents', () => [OrderQueueContentInput])
        contents: OrderQueueContentInput[]
    ): Promise<OrderQueue> {
        const newContents = [];

        for (const content of contents) {
            newContents.push(await content.serialize());
        }

        for (const { item: item_id, quantity } of newContents) {
            const item = await ItemModel.findById(item_id);
            if (!item.order_queue_qtys) {
                item.order_queue_qtys = [[quantity, 1]];
                await item.save();
            } else {
                const index = item.order_queue_qtys
                    .map(([qty, count]) => qty)
                    .indexOf(quantity);

                if (index == -1) {
                    item.order_queue_qtys.push([quantity, 1]);
                } else {
                    item.order_queue_qtys[index] = [
                        quantity,
                        item.order_queue_qtys[index][1] + 1,
                    ];
                }
                await item.save();
            }
        }

        const newQueue: OrderQueueRecord = {
            _id: new mongoose.Types.ObjectId(),
            author: base.created_by,
            contents: newContents,
            date: new Date(),
        };

        await PersonalOrderQueueModel.deleteMany({
            author: base.created_by,
            title: null,
            date: null,
        });

        const doc = await OrderQueueRecordModel.create(newQueue);

        return doc.toJSON() as unknown as OrderQueue;
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.CreateOrderQueue,
        })
    )
    @Query(() => [OrderQueueTemplate])
    async orderQueueTemplates(
        @Ctx() { base }: Context
    ): Promise<OrderQueueTemplate[]> {
        return await OrderQueueTemplateModel.find({
            author: base.created_by,
        })
            .sort({ title: -1 })
            .toJSON();
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.CreateOrderQueue,
        })
    )
    @Query(() => [OrderQueueRecord])
    async orderQueueRecords(
        @Ctx() { base }: Context
    ): Promise<OrderQueueRecord[]> {
        return await OrderQueueRecordModel.find({
            author: base.created_by,
        })
            .sort({ date: -1 })
            .limit(10)
            .toJSON();
    }
}
