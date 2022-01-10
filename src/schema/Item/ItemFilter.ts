import { BaseFilter } from './../Base/BaseFilter';
import { FilterQuery } from 'mongoose';
import { Field, InputType } from 'type-graphql';
import { Item } from './Item';

@InputType()
export class ItemFilter extends BaseFilter {
    @Field({ nullable: true })
    name?: string;

    serializeItemFilter(): FilterQuery<Item> {
        const query: FilterQuery<Item> = this.serializeBaseFilter();
        if (this.name)
            query.$or = [
                ...(query.$or ? query.$or : []),
                { english: { $regex: new RegExp(this.name, 'i') } },
                { spanish: { $regex: new RegExp(this.name, 'i') } },
            ];

        return query;
    }
}
