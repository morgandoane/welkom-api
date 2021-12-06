import { FieldValueUnion } from '../Field/Field';
import { Configured } from '../Configured/Configured';
import { Unit } from '../Unit/Unit';
import { Item } from '../Item/Item';
import {
    DocumentType,
    getModelForClass,
    index,
    modelOptions,
    mongoose,
    prop,
    Ref,
} from '@typegoose/typegoose';
import { Location } from '../Location/Location';
import { Company } from '../Company/Company';
import { Field, ObjectType } from 'type-graphql';
import DataLoader from 'dataloader';

@ObjectType()
@index({ code: 1 })
@modelOptions({
    schemaOptions: {
        collection: 'lots',
    },
})
export class Lot extends Configured {
    @Field()
    @prop({ required: true })
    code!: string;

    @Field(() => Item)
    @prop({ required: true, ref: () => Item })
    item!: Ref<Item>;

    @Field(() => Location, { nullable: true })
    @prop({ required: false, ref: () => Location })
    location?: Ref<Location>;

    @Field(() => Company, { nullable: true })
    @prop({ required: false, ref: () => Company })
    company?: Ref<Company>;

    @Field(() => [FieldValueUnion])
    @prop({ required: true })
    field_values!: Array<typeof FieldValueUnion>;

    @Field(() => [LotContent])
    @prop({ required: true, type: () => LotContent })
    contents!: LotContent[];
}

@ObjectType()
export class LotContent {
    @Field(() => Item)
    @prop({ required: true, ref: () => Item })
    item!: Ref<Item>;

    @Field(() => Unit)
    @prop({ required: true, ref: () => Unit })
    unit!: Ref<Unit>;

    @Field()
    @prop({ required: true })
    quantity!: number;
}

export const LotModel = getModelForClass(Lot);

export const LotLoader = new DataLoader<string, DocumentType<Lot>>(
    async (keys: readonly string[]) => {
        let res: DocumentType<Lot>[] = [];
        await LotModel.find(
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
                new Error('could not find Lot with id' + k)
        );
    }
);
