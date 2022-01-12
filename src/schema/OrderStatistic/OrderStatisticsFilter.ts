import { Order } from '@src/schema/Order/Order';
import { loaderResult } from '@src/utils/loaderResult';
import { index } from '@typegoose/typegoose';
import { addYears, startOfYear, endOfYear } from 'date-fns';
import { ObjectId, FilterQuery } from 'mongoose';
import { Field, InputType } from 'type-graphql';
import { CompanyLoader } from '../Company/Company';
import { ItemModel } from '../Item/Item';
import { LocationModel } from '../Location/Location';
import { ObjectIdScalar } from '../ObjectIdScalar';

@InputType()
export class OrderStatisticFilter {
    @Field(() => Number)
    index!: number;

    @Field({ nullable: true })
    item_name?: string;

    @Field(() => ObjectIdScalar, { nullable: true })
    vendor?: ObjectId;

    @Field(() => ObjectIdScalar, { nullable: true })
    destination?: ObjectId;

    public async serializeFilter(): Promise<FilterQuery<Order>> {
        const query: FilterQuery<Order> = {};

        if (this.item_name) {
            const items = await ItemModel.find(
                !this.item_name
                    ? { deleted: false }
                    : {
                          deleted: false,
                          english: { $regex: new RegExp(this.item_name, 'i') },
                      }
            );

            query['contents.item'] = { $in: items.map((i) => i._id) };
        }

        const now = new Date();

        const nowIndexed = addYears(now, this.index);

        query['contents.due'] = {
            $gte: startOfYear(nowIndexed),
            $lte: endOfYear(nowIndexed),
        };

        if (this.vendor) {
            // const vendorDoc = loaderResult(
            //     await CompanyLoader.load(this.vendor.toString())
            // );
        }

        if (this.destination) {
            query['contents.location'] = this.destination;
        }

        console.log(query);

        return query;
    }
}
