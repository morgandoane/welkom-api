import { ConfigModel } from './../Config/Config';
import { ConfigKey } from '@src/schema/Config/Config';
import {
    prop,
    getDiscriminatorModelForClass,
    DocumentType,
    mongoose,
} from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { Config } from '../Config/Config';
import DataLoader from 'dataloader';

@ObjectType()
export class ItemClass extends Config {
    @Field(() => ConfigKey)
    @prop({ required: true })
    key: ConfigKey.Item;

    @Field()
    @prop({ required: true })
    name: string;

    @Field()
    @prop({ required: true, default: false })
    deleted!: boolean;
}

export const ItemClassModel = getDiscriminatorModelForClass(
    ConfigModel,
    ItemClass
);

export const ItemClassLoader = new DataLoader<string, DocumentType<ItemClass>>(
    async (keys: readonly string[]) => {
        let res: DocumentType<ItemClass>[] = [];
        await ItemClassModel.find(
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
                new Error('could not find ItemClass with id ' + k)
        );
    }
);
