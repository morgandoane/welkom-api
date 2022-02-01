import { DateRangeInput } from './../Range/DateRange/DateRangeInput';
import { Batch } from './Batch';
import { UploadEnabledFilter } from './../UploadEnabled/UploadEnabledFilter';
import { Field, InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { DocumentType, Ref } from '@typegoose/typegoose';
import { BatchLot } from '../BatchLot/BatchLot';
import { Company } from '../Company/Company';
import { Location } from '../Location/Location';
import { ProductionLine } from '../ProductionLine/ProductionLine';
import { RecipeVersion } from '../RecipeVersion/RecipeVersion';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { endOfDay, startOfDay } from 'date-fns';

@InputType()
export class BatchFilter extends UploadEnabledFilter {
    @Field(() => ObjectIdScalar, { nullable: true })
    recipe_version?: Ref<RecipeVersion> | null;

    @Field(() => ObjectIdScalar, { nullable: true })
    lot?: Ref<BatchLot>;

    @Field(() => ObjectIdScalar, { nullable: true })
    location?: Ref<Location>;

    @Field(() => ObjectIdScalar, { nullable: true })
    company?: Ref<Company>;

    @Field(() => ObjectIdScalar, { nullable: true })
    production_line?: Ref<ProductionLine> | null;

    @Field(() => DateRangeInput, { nullable: true })
    date_completed?: DateRangeInput;

    public async serializeBatchFilter(): Promise<
        FilterQuery<DocumentType<Batch>>
    > {
        const query = {
            ...(await this.serializeUploadEnabledFilter()),
        } as FilterQuery<DocumentType<Batch>>;

        if (this.recipe_version) query.recipe_version = this.recipe_version;
        if (this.lot) query.lot = this.lot;
        if (this.location) query.location = this.location;
        if (this.company) query.company = this.company;
        if (this.production_line) query.production_line = this.production_line;
        if (this.date_completed)
            query.date_completed = {
                $gte: startOfDay(this.date_completed.start),
                $lte: endOfDay(this.date_completed.end),
            };

        return query;
    }
}
