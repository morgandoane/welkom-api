import { Context } from '../../auth/context';
import { FulfillmentLotFinder } from './FulfillmentLotFinder';
import { Field, InputType } from 'type-graphql';
import { Fulfillment } from './Fulfillment';

@InputType()
export class UpdateFulfillmentInput {
    @Field(() => [FulfillmentLotFinder], { nullable: true })
    contents?: FulfillmentLotFinder[];

    @Field({ nullable: true })
    deleted?: boolean;

    public async validateFulfillment(
        context: Context
    ): Promise<() => Promise<Partial<Fulfillment>>> {
        if (this.deleted !== null && this.deleted !== undefined)
            return async () => ({ deleted: this.deleted });

        if (this.contents)
            return async () => {
                const res: Partial<Fulfillment> = {
                    contents: [],
                };

                for (const c of this.contents) {
                    const createContent = await c.getExecutable(context);
                    const { lot, content } = await createContent();
                    res.contents.push(content);
                }

                return res;
            };

        return async () => ({});
    }
}
