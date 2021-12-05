import { FieldValueFilter } from './../Field/inputs/FieldValueFilter';
import { DocumentType } from '@typegoose/typegoose';
import { DateRangeInput } from './../DateRange/DateRangeInput';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { ObjectId } from 'mongodb';
import { Field, InputType } from 'type-graphql';
import { PaginateArg } from '../Pagination/Pagination';
import { FilterQuery } from 'mongoose';
import { Configured } from './Configured';
import { endOfDay, startOfDay } from 'date-fns';

@InputType()
export class ConfiguredFilter extends PaginateArg {
    @Field(() => ObjectIdScalar, { nullable: true })
    config?: ObjectId;

    @Field({ nullable: true })
    deleted?: boolean;

    @Field(() => ObjectIdScalar, { nullable: true })
    created_by?: ObjectId;

    @Field(() => ObjectIdScalar, { nullable: true })
    modified_by?: ObjectId;

    @Field(() => DateRangeInput, { nullable: true })
    date_created?: DateRangeInput;

    @Field(() => DateRangeInput, { nullable: true })
    date_modified?: DateRangeInput;

    @Field(() => [FieldValueFilter], { nullable: true })
    field_values?: FieldValueFilter[];

    public serialize(): FilterQuery<DocumentType<Configured>> {
        const query: FilterQuery<DocumentType<Configured>> = {};

        if (this.config !== undefined) query.config = this.config;
        if (this.deleted !== undefined) query.deleted = this.deleted;
        if (this.created_by !== undefined) query.created_by = this.created_by;
        if (this.modified_by !== undefined)
            query.modified_by = this.modified_by;
        if (this.date_created !== undefined)
            query.date_created = {
                $gte: startOfDay(this.date_created.start),
                $lte: endOfDay(this.date_created.end),
            };
        if (this.date_modified !== undefined)
            query.date_modified = {
                $gte: startOfDay(this.date_modified.start),
                $lte: endOfDay(this.date_modified.end),
            };
        if (this.date_modified !== undefined)
            query.date_modified = {
                $gte: startOfDay(this.date_modified.start),
                $lte: endOfDay(this.date_modified.end),
            };

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
