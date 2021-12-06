import { Context } from './../../../../auth/context';
import { BucketLot } from './BucketLot';
import { InputType } from 'type-graphql';
import { LotInput } from '../../LotInput';

@InputType()
export class BucketLotInput extends LotInput {
    public async validateBucketLot(context: Context): Promise<BucketLot> {
        const baseLot = await this.validateLot(context);
        const res: BucketLot = { ...baseLot };
        return res;
    }
}
