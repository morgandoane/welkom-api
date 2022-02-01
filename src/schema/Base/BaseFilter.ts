import { DocumentType } from '@typegoose/typegoose';
import { startOfDay, endOfDay } from 'date-fns';
import { FilterQuery } from 'mongoose';
import { Field, InputType } from 'type-graphql';
import { PaginateArg } from '../Pagination/Pagination';
import { DateRangeInput } from '../Range/DateRange/DateRangeInput';
import { Base } from './Base';

@InputType()
export class BaseFilter extends PaginateArg {
    @Field({ nullable: true, defaultValue: false })
    deleted?: boolean = false;

    @Field({ nullable: true })
    created_by?: string;

    @Field(() => DateRangeInput, { nullable: true })
    date_created?: DateRangeInput;

    public async serializeBaseFilter(): Promise<
        FilterQuery<DocumentType<Base>>
    > {
        const query: FilterQuery<DocumentType<Base>> = {};

        if (this.deleted !== undefined) query.deleted = this.deleted;
        if (this.created_by !== undefined) query.created_by = this.created_by;
        if (this.date_created !== undefined)
            query.date_created = {
                $gte: startOfDay(this.date_created.start),
                $lte: endOfDay(this.date_created.end),
            };

        return query;
    }
}
