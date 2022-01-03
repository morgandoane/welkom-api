import { CompanyLoader } from './../Company/Company';
import { LocationLoader } from './../Location/Location';
import { UnitLoader } from './../Unit/Unit';
import { ItemLoader } from './../Item/Item';
import { Field, InputType } from 'type-graphql';
import { OrderQueueContent } from './OrderQueue';
import { loaderResult } from '@src/utils/loaderResult';

@InputType()
export class OrderQueueContentInput {
    @Field({ nullable: true })
    order_code?: string;

    @Field({ nullable: true })
    item?: string;

    @Field({ nullable: true })
    company?: string;

    @Field({ nullable: true })
    unit?: string;

    @Field({ nullable: true })
    quantity?: number;

    @Field({ nullable: true })
    location?: string;

    @Field({ nullable: true })
    date?: Date;

    public async serialize(): Promise<OrderQueueContent> {
        const content: OrderQueueContent = {};

        if (this.order_code) content.order_code = this.order_code;

        if (this.item) {
            const item = loaderResult(await ItemLoader.load(this.item));
            content.item = item._id;
        }

        if (this.company) {
            const company = loaderResult(
                await CompanyLoader.load(this.company)
            );
            content.company = company._id;
        }

        if (this.unit) {
            const unit = loaderResult(await UnitLoader.load(this.unit));
            content.unit = unit._id;
        }

        if (this.quantity !== null && this.quantity !== undefined)
            content.quantity = this.quantity;

        if (this.location) {
            const location = loaderResult(
                await LocationLoader.load(this.location)
            );
            content.location = location._id;
        }

        if (this.date) content.date = this.date;

        return content;
    }
}
