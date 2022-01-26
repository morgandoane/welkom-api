import { BaseFilter } from './../Base/BaseFilter';
import { FilterQuery } from 'mongoose';
import { Field, InputType } from 'type-graphql';
import { Item, ItemType } from './Item';

@InputType()
export class ItemFilter extends BaseFilter {
    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true, defaultValue: false })
    primitive?: boolean;

    @Field({ nullable: true, defaultValue: null })
    type?: ItemType;

    @Field({ nullable: true })
    upc?: string;

    serializeItemFilter(): FilterQuery<Item> {
        const query: FilterQuery<Item> = this.serializeBaseFilter();

        if (this.upc !== undefined) {
            if (this.upc)
                query.upc = {
                    $regex: new RegExp(this.upc, 'i'),
                };
            else query.upc = null;
        }

        if (this.type !== undefined) {
            if (this.type) query.type = this.type;
            else
                query.$or = [
                    ...(query.$or ? query.$or : []),
                    { type: null },
                    { type: { $exists: false } },
                ];
        }

        if (this.name)
            query.$or = [
                ...(query.$or ? query.$or : []),
                { english: { $regex: new RegExp(this.name, 'i') } },
                { spanish: { $regex: new RegExp(this.name, 'i') } },
            ];

        if (this.primitive !== undefined && this.primitive !== null) {
            query.$and = [
                {
                    $or: [
                        { primitive: false },
                        { primitive: { $exists: false } },
                    ],
                },
            ];
        }

        return query;
    }
}
