import { QualityCheckResponseInput } from './../QualityCheckResponse/QualityCheckResponseInput';
import { mongoose } from '@typegoose/typegoose';
import { ItemLoader } from './../Item/Item';
import { loaderResult } from './../../utils/loaderResult';
import { ObjectId } from 'mongoose';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { Field, InputType } from 'type-graphql';
import { LotContentInput } from './../Content/ContentInputs';
import { Lot } from './Lot';
import { Context } from '@src/auth/context';
import { QualityCheckResponse } from '../QualityCheckResponse/QualityCheckResponse';

@InputType()
export class LotInput {
    @Field()
    code!: string;

    @Field(() => ObjectIdScalar)
    item!: ObjectId;

    @Field(() => [QualityCheckResponseInput])
    quality_check_responses!: QualityCheckResponseInput[];

    @Field(() => ObjectIdScalar, { nullable: true })
    location?: ObjectId;

    @Field(() => ObjectIdScalar, { nullable: true })
    company?: ObjectId;

    @Field(() => [LotContentInput])
    contents!: LotContentInput[];

    public async validateLot(context: Context): Promise<Lot> {
        const item = await loaderResult(ItemLoader.load(this.item.toString()));

        const responses: QualityCheckResponse[] = [];

        for (const response of this.quality_check_responses) {
            responses.push(await response.validateResponse(context));
        }

        const res: Lot = {
            ...context.base,
            code: this.code,
            item: item._id,
            quality_check_responses: responses,
            location: this.location
                ? new mongoose.Types.ObjectId(this.location.toString())
                : undefined,
            company: this.company
                ? new mongoose.Types.ObjectId(this.company.toString())
                : undefined,
            contents: [],
            start_quantity: 0,
        };

        for (const content of this.contents) {
            res.contents.push(await content.validateLotContent());
        }

        return res;
    }
}

@InputType()
export class UpdateLotInput {
    @Field()
    code?: string;

    @Field(() => ObjectIdScalar)
    item?: ObjectId;

    @Field(() => ObjectIdScalar, { nullable: true })
    location?: ObjectId;

    @Field(() => ObjectIdScalar, { nullable: true })
    company?: ObjectId;

    @Field(() => [LotContentInput])
    contents?: LotContentInput[];

    public async validateLotUpdate(context: Context): Promise<Partial<Lot>> {
        const res: Partial<Lot> = {
            date_modified: context.base.date_modified,
            modified_by: context.base.modified_by,
        };

        if (this.contents) {
            res.contents = [];
            for (const content of this.contents) {
                res.contents.push(await content.validateLotContent());
            }
        }

        if (this.code) res.code = this.code;
        if (this.item)
            res.item = new mongoose.Types.ObjectId(this.item.toString());
        if (this.location)
            res.location = new mongoose.Types.ObjectId(
                this.location.toString()
            );
        if (this.company)
            res.company = new mongoose.Types.ObjectId(this.company.toString());

        return res;
    }
}
