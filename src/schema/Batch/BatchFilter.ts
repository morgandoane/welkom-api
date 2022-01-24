import { DateRangeInput } from './../DateRange/DateRangeInput';
import { startOfDay, endOfDay } from 'date-fns';
import { Batch } from './Batch';
import { BaseFilter } from './../Base/BaseFilter';
import { Field, InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';

@InputType()
export class BatchFilter extends BaseFilter {
    @Field(() => DateRangeInput, { nullable: true })
    date_completed?: DateRangeInput;

    public serializeBatchFilter(): FilterQuery<DocumentType<Batch>> {
        const res: FilterQuery<DocumentType<Batch>> = {
            ...this.serializeBaseFilter(),
        } as FilterQuery<DocumentType<Batch>>;

        if (this.date_completed !== undefined) {
            if (this.date_completed == null) {
                res.$or = [
                    ...(res.$or || []),
                    { date_completed: null },
                    { date_completed: { $exists: false } },
                ];
            } else {
                res.date_completed = {
                    $gte: startOfDay(this.date_completed.start),
                    $lte: endOfDay(this.date_completed.end),
                };
            }
        }

        return res;
    }
}
