import { UploadEnabledFilter } from './../UploadEnabled/UploadEnabledFilter';
import { Field, InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { Item } from './Item';

@InputType()
export class ItemFilter extends UploadEnabledFilter {
    @Field({ nullable: true })
    name?: string;

    public async serializeItemFilter(): Promise<FilterQuery<Item>> {
        const res: FilterQuery<Item> = {
            ...(await this.serializeUploadEnabledFilter()),
        };

        if (this.name) {
            res.$or = [
                ...(res.$or || []),
                { ['names.english']: { $regex: new RegExp(this.name, 'i') } },
                { ['names.spanish']: { $regex: new RegExp(this.name, 'i') } },
            ];
        }

        return res;
    }
}
