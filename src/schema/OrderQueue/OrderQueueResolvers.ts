import { mongoose } from '@typegoose/typegoose';
import { Context } from '@src/auth/context';
import { OrderQueueContentInput } from './OrderQueueInput';
import {
    OrderQueue,
    OrderQueueModel,
    OrderQueueRecord,
    OrderQueueRecordModel,
    OrderQueueTemplate,
    OrderQueueTemplateModel,
} from './OrderQueue';
import { Arg, Mutation, Resolver, Ctx, Query } from 'type-graphql';

@Resolver(() => OrderQueue)
export class OrderQueueResolvers {
    @Query(() => OrderQueue)
    async orderQueue(@Ctx() { base }: Context): Promise<OrderQueue> {
        const match = await OrderQueueModel.findOne({
            author: base.created_by,
            date: { $exists: false },
            title: { $exists: false },
        });

        if (match) return match.toJSON();

        const newQueue: OrderQueue = {
            _id: new mongoose.Types.ObjectId(),
            author: base.created_by,
            contents: [],
        };

        const res = await OrderQueueModel.create(newQueue);

        return res.toJSON();
    }

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

        const newQueue: OrderQueue = {
            _id: new mongoose.Types.ObjectId(),
            author: base.created_by,
            contents: newContents,
        };

        await OrderQueueModel.deleteMany({
            author: base.created_by,
            title: null,
            date: null,
        });

        const doc = await OrderQueueModel.create(newQueue);

        return doc.toJSON();
    }

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

        const newQueue: OrderQueueRecord = {
            _id: new mongoose.Types.ObjectId(),
            author: base.created_by,
            contents: newContents,
            date: new Date(),
        };

        await OrderQueueModel.deleteMany({
            author: base.created_by,
            title: null,
            date: null,
        });

        const doc = await OrderQueueRecordModel.create(newQueue);

        return doc.toJSON();
    }

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
