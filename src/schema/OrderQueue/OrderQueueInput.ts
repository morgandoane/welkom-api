import { UserInputError } from 'apollo-server-errors';
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
    vendor?: string;

    @Field({ nullable: true })
    vendor_location?: string;

    @Field({ nullable: true })
    unit?: string;

    @Field({ nullable: true })
    quantity?: number;

    @Field({ nullable: true })
    location?: string;

    @Field({ nullable: true })
    date?: Date;

    @Field({ nullable: true })
    time_sensitive?: boolean;

    public async serialize(): Promise<OrderQueueContent> {
        const content: OrderQueueContent = {};

        if (this.order_code) content.order_code = this.order_code;

        if (this.item) {
            const item = loaderResult(await ItemLoader.load(this.item));
            content.item = item._id;
        }

        if (this.vendor) {
            const company = loaderResult(await CompanyLoader.load(this.vendor));
            content.vendor = company._id;
        }

        if (this.vendor_location) {
            const location = loaderResult(
                await LocationLoader.load(this.vendor_location)
            );
            if (location.company.toString() !== this.vendor)
                throw new UserInputError(
                    'Vendor location does not match specified content vendor.'
                );

            content.vendor_location = location._id;
        }

        if (this.unit) {
            const unit = loaderResult(await UnitLoader.load(this.unit));
            content.unit = unit._id;
        }

        if (this.quantity !== null && this.quantity !== undefined)
            content.quantity = this.quantity;

        if (this.time_sensitive !== null && this.time_sensitive !== undefined)
            content.time_sensitive = this.time_sensitive;

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
