import { Field, ObjectType } from 'type-graphql';
import {
    DocumentType,
    getModelForClass,
    mongoose,
    prop,
} from '@typegoose/typegoose';
import { Base } from '../Base/Base';
import DataLoader from 'dataloader';

export enum UnitClass {
    Count = 'Count',
    Time = 'Time',
    Volume = 'Volume',
    Weight = 'Weight',
}

@ObjectType()
export class Unit extends Base {
    @Field(() => UnitClass)
    @prop({ required: true, enum: UnitClass })
    class!: UnitClass;

    @Field()
    @prop({ required: true })
    english!: string;

    @Field({ nullable: true })
    @prop({ required: false })
    spanish?: string;

    @Field({ nullable: true })
    @prop({ required: false })
    english_plural?: string;

    @Field({ nullable: true })
    @prop({ required: false })
    spanish_plural?: string;
}

export const UnitModel = getModelForClass(Unit);

export const UnitLoader = new DataLoader<string, DocumentType<Unit>>(
    async (keys: readonly string[]) => {
        let res: DocumentType<Unit>[] = [];
        await UnitModel.find(
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
                new Error('could not find Unit with id ' + k)
        );
    }
);
