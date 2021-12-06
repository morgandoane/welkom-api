import { mongoose } from '@typegoose/typegoose';
import { ItemLoader } from './../Item/Item';
import { loaderResult } from './../../utils/loaderResult';
import { ObjectId } from 'mongoose';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { ConfiguredInput } from './../Configured/ConfiguredInput';
import { Field, InputType } from 'type-graphql';
import { LotContentInput } from './../Content/ContentInputs';
import { Lot } from './Lot';
import { Context } from '@src/auth/context';

@InputType()
export class LotInput extends ConfiguredInput {
    @Field()
    code!: string;

    @Field(() => ObjectIdScalar)
    item!: ObjectId;

    @Field(() => ObjectIdScalar, { nullable: true })
    location?: ObjectId;

    @Field(() => ObjectIdScalar, { nullable: true })
    company?: ObjectId;

    @Field(() => [LotContentInput])
    contents!: LotContentInput[];

    public async validateLot(context: Context): Promise<Lot> {
        const configured = await this.validate(context);

        if (this.item) {
            await loaderResult(ItemLoader.load(this.item.toString()));
        }

        const res: Lot = {
            ...configured,
            code: this.code,
            item: this.item
                ? new mongoose.Types.ObjectId(this.item.toString())
                : undefined,
            location: this.location
                ? new mongoose.Types.ObjectId(this.location.toString())
                : undefined,
            company: this.company
                ? new mongoose.Types.ObjectId(this.company.toString())
                : undefined,
            contents: [],
        };

        for (const content of this.contents) {
            res.contents.push(await content.validateLotContent());
        }

        return res;
    }
}
