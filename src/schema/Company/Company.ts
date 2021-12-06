import { Field, ObjectType } from 'type-graphql';
import { Configured } from '../Configured/Configured';
import {
    DocumentType,
    getModelForClass,
    modelOptions,
    mongoose,
    prop,
} from '@typegoose/typegoose';
import DataLoader from 'dataloader';
import { Location } from '../Location/Location';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'companies',
    },
})
export class Company extends Configured {
    @Field()
    @prop({ required: true })
    name!: string;

    @Field(() => [Location])
    locations?: Location[];
}

export const CompanyModel = getModelForClass(Company);

export const CompanyLoader = new DataLoader<string, DocumentType<Company>>(
    async (keys: readonly string[]) => {
        let res: DocumentType<Company>[] = [];

        await CompanyModel.find(
            {
                _id: {
                    $in: keys.map((k) => new mongoose.Types.ObjectId(k)),
                },
            },
            (err, docs) => {
                if (err) throw err;
                else res = docs;
            }
        ).lean();

        return keys.map(
            (k) =>
                res.find((d) => d._id.toString() === k) ||
                new Error('could not find Company with id ' + k)
        );
    }
);
