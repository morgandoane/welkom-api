import { BaseFilter } from './../../../Base/BaseFilter';
import { ProceduralLot } from './ProceduralLot';
import { FilterQuery } from 'mongoose';
import { Field, InputType } from 'type-graphql';

@InputType()
export class ProceduralLotFilter extends BaseFilter {
    @Field({ nullable: true })
    code?: string;

    serializeProceduralLotFilter(): FilterQuery<ProceduralLot> {
        const query: FilterQuery<ProceduralLot> = this.serializeBaseFilter();
        if (this.code) query.code = { $regex: new RegExp(this.code, 'i') };

        return query;
    }
}
