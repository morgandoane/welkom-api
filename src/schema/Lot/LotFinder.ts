import { Lot } from './Lot';
import { FilterQuery, ObjectId } from 'mongoose';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { Field, InputType } from 'type-graphql';
import { mongoose, DocumentType } from '@typegoose/typegoose';

@InputType()
export class LotFinder {
    @Field(() => ObjectIdScalar, { nullable: true })
    _id?: ObjectId;

    @Field({ nullable: true })
    code?: string;

    @Field(() => ObjectIdScalar, { nullable: true })
    company?: ObjectId;

    @Field(() => [ObjectIdScalar], { nullable: true })
    items?: ObjectId[];

    @Field(() => ObjectIdScalar, { nullable: true })
    location?: ObjectId;

    public async serialize(): Promise<FilterQuery<DocumentType<Lot>>> {
        if (this._id) return { _id: this._id.toString() };

        const res: FilterQuery<DocumentType<Lot>> = {};

        if (this.code) res.code = this.code;
        if (this.company) res.company = this.company.toString();
        if (this.location) res.location = this.location.toString();
        if (this.items)
            res.item = {
                $in: this.items.map(
                    (i) => new mongoose.Types.ObjectId(i.toString())
                ),
            };

        return res;
    }
}
