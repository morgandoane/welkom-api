import { UpdateLotInput } from './../../LotInput';
import { Context } from './../../../../auth/context';
import { BucketLot } from './BucketLot';
import { Field, InputType } from 'type-graphql';
import { LotInput } from '../../LotInput';
import { BucketLotContentInput } from '@src/schema/Content/ContentInputs';

@InputType()
export class BucketLotInput extends LotInput {
    @Field(() => [BucketLotContentInput])
    contents!: BucketLotContentInput[];

    public async validateBucketLot(context: Context): Promise<BucketLot> {
        const baseLot = await this.validateLot(context);

        const res: BucketLot = { ...baseLot, contents: [] };

        for (const content of this.contents) {
            res.contents.push(await content.validateBucketLotContent());
        }

        return res;
    }
}

@InputType()
export class UpdateBucketLotInput extends UpdateLotInput {
    @Field(() => [BucketLotContentInput])
    contents?: BucketLotContentInput[];

    public async validateBucketLotUpdate(
        context: Context
    ): Promise<Partial<BucketLot>> {
        const res: Partial<BucketLot> = {
            ...(await this.validateLotUpdate(context)),
        };

        if (this.contents) {
            res.contents = [];
            for (const content of this.contents) {
                res.contents.push(await content.validateLotContent());
            }
        }

        return res;
    }
}
