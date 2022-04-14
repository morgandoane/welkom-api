import { BolLoader } from './../Bol/BolModel';
import { Context } from './../../auth/context';
import { FulfillmentLotFinder } from './FulfillmentLotFinder';
import { prop, Ref } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { Bol } from '../Bol/Bol';
import { Fulfillment, FulfillmentType } from './Fulfillment';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';

@InputType()
export class CreateFulfillmentInput {
    @Field(() => FulfillmentType)
    @prop({ required: true, enum: FulfillmentType })
    type!: FulfillmentType;

    @Field(() => ObjectIdScalar)
    @prop({ required: true, ref: () => Bol })
    bol!: Ref<Bol>;

    @Field(() => [FulfillmentLotFinder])
    @prop({ required: true, type: () => FulfillmentLotFinder })
    contents!: FulfillmentLotFinder[];

    public async validateFulfillment(
        context: Context
    ): Promise<() => Promise<Fulfillment>> {
        const bol = await BolLoader.load(this.bol, true);

        return async () => {
            const fulfillment: Fulfillment = {
                ...context.base,
                bol: bol._id,
                type: this.type,
                contents: [],
            };

            for (const c of this.contents) {
                const createContent = await c.getExecutable(context);
                const { lot, content } = await createContent();
                fulfillment.contents.push(content);
            }

            return fulfillment;
        };
    }
}
