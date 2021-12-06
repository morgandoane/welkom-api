import { ItemClass } from './../ItemClass/ItemClass';
import { Field, ObjectType } from 'type-graphql';
import { Configured } from '../Configured/Configured';
import { UnitClass } from '../Unit/Unit';
import {
    DocumentType,
    getModelForClass,
    modelOptions,
    mongoose,
    prop,
    Ref,
} from '@typegoose/typegoose';
import DataLoader from 'dataloader';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'items',
    },
})
export class Item extends Configured {
    @Field(() => ItemClass)
    @prop({ required: true, ref: () => ItemClass })
    item_class!: Ref<ItemClass>;

    @Field(() => UnitClass)
    @prop({ required: true, enum: UnitClass })
    unit_class!: UnitClass;

    @Field()
    @prop({ required: true })
    english!: string;

    @Field()
    @prop({ required: true })
    spanish!: string;
}

export const ItemModel = getModelForClass(Item);

export const ItemLoader = new DataLoader<string, DocumentType<Item>>(
    async (keys: readonly string[]) => {
        let res: DocumentType<Item>[] = [];
        await ItemModel.find(
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
                new Error('could not find Item with id' + k)
        );
    }
);
