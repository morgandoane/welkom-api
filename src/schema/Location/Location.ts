import { createUnionType, Field, ObjectType } from 'type-graphql';
import { Address } from '../Address/Address';
import {
    DocumentType,
    getModelForClass,
    modelOptions,
    mongoose,
    prop,
    Ref,
} from '@typegoose/typegoose';
import { Company } from '../Company/Company';
import { Base } from '../Base/Base';
import DataLoader from 'dataloader';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'locations',
    },
})
export class Location extends Base {
    @Field(() => Company)
    @prop({ required: true, ref: 'Company' })
    company!: Ref<Company>;

    @Field(() => Address, { nullable: true })
    @prop({ required: false })
    address?: Address;

    @Field({ nullable: true })
    @prop({ required: false })
    label?: string;
}

export const LocationModel = getModelForClass(Location);

export const LocationLoader = new DataLoader<string, DocumentType<Location>>(
    async (keys: readonly string[]) => {
        let res: DocumentType<Location>[] = [];
        await LocationModel.find(
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
                new Error('could not find Location with id' + k)
        );
    }
);
