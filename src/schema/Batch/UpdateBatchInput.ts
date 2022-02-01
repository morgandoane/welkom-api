import { ProductionLineLoader } from './../ProductionLine/ProductionLine';
import { CompanyLoader } from '../Company/Company';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { ProductionLine } from '../ProductionLine/ProductionLine';
import { Ref } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { Location, LocationLoader } from '../Location/Location';
import { Batch } from './Batch';
import { Company } from '../Company/Company';
import { BatchLot } from '../BatchLot/BatchLot';

@InputType()
export class UpdateBatchInput {
    @Field(() => ObjectIdScalar, { nullable: true })
    location?: Ref<Location>;

    @Field(() => ObjectIdScalar, { nullable: true })
    company?: Ref<Company>;

    @Field(() => ObjectIdScalar, { nullable: true })
    production_line?: Ref<ProductionLine> | null;

    @Field(() => Boolean, { nullable: true })
    deleted?: boolean | null;

    public async serializeBatchUpdate(): Promise<{
        batch: Partial<Batch>;
        lot: Partial<BatchLot>;
    }> {
        const batchUpdate: Partial<Batch> = {};
        const lotUpdate: Partial<BatchLot> = {};

        if (this.location) {
            const { _id: location } = await LocationLoader.load(
                this.location.toString(),
                true
            );

            batchUpdate.location = location;
            lotUpdate.location = location;
        }

        if (this.company) {
            const { _id: company } = await CompanyLoader.load(
                this.company.toString(),
                true
            );

            batchUpdate.company = company;
            lotUpdate.company = company;
        }

        if (this.production_line) {
            const { _id: production_line } = await ProductionLineLoader.load(
                this.production_line.toString(),
                true
            );

            batchUpdate.production_line = production_line;
            lotUpdate.production_line = production_line;
        }

        if (this.deleted !== null && this.deleted !== undefined) {
            batchUpdate.deleted = this.deleted;
            lotUpdate.deleted = this.deleted;
        }

        return {
            batch: batchUpdate,
            lot: lotUpdate,
        };
    }
}
