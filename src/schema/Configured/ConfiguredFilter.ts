import { BaseFilter } from './../Base/BaseFilter';
import { FieldValueFilter } from './../Field/inputs/FieldValueFilter';
import { DocumentType } from '@typegoose/typegoose';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { ObjectId } from 'mongodb';
import { Field, InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { Configured } from './Configured';

@InputType()
export class ConfiguredFilter extends BaseFilter {
    @Field(() => ObjectIdScalar, { nullable: true })
    config?: ObjectId;

    @Field(() => [FieldValueFilter], { nullable: true })
    field_values?: FieldValueFilter[];

    public serializeConfiguredFilter(): FilterQuery<DocumentType<Configured>> {
        const query = this.serializeBaseFilter() as FilterQuery<
            DocumentType<Configured>
        >;

        if (this.config !== undefined) query.config = this.config;

        if (this.field_values !== undefined) {
            query.$and = this.field_values.map((filter) => ({
                field_values: {
                    $elemMatch: filter.serialize(),
                },
            })) as FilterQuery<DocumentType<Configured>>['$and'];
        }

        return query;
    }
}
