import { Field, ObjectType } from 'type-graphql';
import { ItemContent } from '../Content/Content';
import {
    DocumentType,
    getModelForClass,
    modelOptions,
    mongoose,
    prop,
    Ref,
} from '@typegoose/typegoose';
import { Company } from '../Company/Company';
import { Configured } from '../Configured/Configured';
import DataLoader from 'dataloader';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'orders',
    },
})
export class Order extends Configured {
    @Field(() => Company, { nullable: true })
    @prop({ required: false, ref: () => Company })
    customer?: Ref<Company>;

    @Field(() => Company, { nullable: true })
    @prop({ required: false, ref: () => Company })
    vendor?: Ref<Company>;

    @Field(() => [ItemContent])
    @prop({ required: true, type: () => ItemContent })
    contents!: ItemContent[];

    @Field({ nullable: true })
    @prop({ required: false })
    due?: Date;
}

export const OrderModel = getModelForClass(Order);

export const OrderLoader = new DataLoader<string, DocumentType<Order>>(
    async (keys: readonly string[]) => {
        let res: DocumentType<Order>[] = [];
        await OrderModel.find(
            {
                _id: {
                    $in: keys.map((k) => new mongoose.Types.ObjectId(k)),
                },
            },
            (err, docs) => {
                if (err) throw err;
                else res = docs;
            }
        );

        return keys.map(
            (k) =>
                res.find((d) => d._id.toString() === k) ||
                new Error('could not find Order with id' + k)
        );
    }
);
