import { OrderQueueLineInput } from './../OrderQueueLine/OrderQueueLineInput';
import { Context } from '@src/auth/context';
import { Field, InputType } from 'type-graphql';
import { OrderQueue } from './OrderQueue';

@InputType()
export class OrderQueueInput {
    @Field(() => [OrderQueueLineInput])
    lines!: OrderQueueLineInput[];

    public async validateOrderQueueInput(
        context: Context
    ): Promise<OrderQueue> {
        const res: OrderQueue = {
            ...context.base,
            lines: await Promise.all(
                this.lines.map((app) => app.validateOrderQueueLineInput())
            ),
        };

        return res;
    }
}
