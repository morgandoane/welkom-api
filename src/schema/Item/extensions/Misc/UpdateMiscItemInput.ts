import { MiscItem } from './MiscItem';
import { Field, InputType } from 'type-graphql';
import { UpdateItemInput } from '../../UpdateItemInput';
import { Min } from 'class-validator';

@InputType()
export class UpdateMiscItemInput extends UpdateItemInput {
    @Min(0)
    @Field({ nullable: true })
    per_base_unit?: number;

    public async serializeMiscItemUpdate(): Promise<Partial<MiscItem>> {
        const res: Partial<MiscItem> = { ...(await this.serializeItem()) };

        if (this.per_base_unit) res.per_base_unit = this.per_base_unit;

        return res;
    }
}
