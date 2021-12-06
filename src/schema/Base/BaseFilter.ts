import { DocumentType } from '@typegoose/typegoose';
import { startOfDay, endOfDay } from 'date-fns';
import { FilterQuery } from 'mongoose';
import { Field, InputType } from 'type-graphql';
import { DateRangeInput } from '../DateRange/DateRangeInput';
import { PaginateArg } from '../Pagination/Pagination';
import { Base } from './Base';

@InputType()
export class BaseFilter extends PaginateArg {
    @Field({ nullable: true })
    deleted?: boolean = false;

    @Field({ nullable: true })
    created_by?: string;

    @Field({ nullable: true })
    modified_by?: string;

    @Field(() => DateRangeInput, { nullable: true })
    date_created?: DateRangeInput;

    @Field(() => DateRangeInput, { nullable: true })
    date_modified?: DateRangeInput;

    public serializeBaseFilter(): FilterQuery<DocumentType<Base>> {
        const query: FilterQuery<DocumentType<Base>> = {};

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

        return query;
    }
}
