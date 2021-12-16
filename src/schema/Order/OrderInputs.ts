import { Context } from './../../auth/context';
import { CompanyLoader } from './../Company/Company';
import { loaderResult } from './../../utils/loaderResult';
import { ItemContentInput } from './../Content/ContentInputs';
import { ObjectId } from 'mongoose';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { Ctx, Field, InputType } from 'type-graphql';
import { Order } from './Order';
import { DocumentType } from '@typegoose/typegoose';

@InputType()
export class CreateOrderInput {
    @Field(() => ObjectIdScalar, { nullable: true })
    customer?: ObjectId;

    @Field(() => ObjectIdScalar, { nullable: true })
    vendor?: ObjectId;

    @Field(() => [ItemContentInput])
    contents!: ItemContentInput[];

    @Field({ nullable: true })
    due?: Date;

    async validateOrder(@Ctx() context: Context): Promise<Order> {
        const order: Order = { ...context.base, contents: [] };
        if (this.customer) {
            const customer = loaderResult(
                await CompanyLoader.load(this.customer.toString())
            );
            order.customer = customer._id;
        }

        if (this.vendor) {
            const vendor = loaderResult(
                await CompanyLoader.load(this.vendor.toString())
            );
            order.vendor = vendor._id;
        }

        if (this.due) order.due = this.due;

        for (const content of this.contents) {
            order.contents.push(await content.validateItemContent());
        }

        return order;
    }
}

@InputType()
export class UpdateOrderInput {
    @Field(() => ObjectIdScalar, { nullable: true })
    customer?: ObjectId;

    @Field(() => ObjectIdScalar, { nullable: true })
    vendor?: ObjectId;

    @Field(() => [ItemContentInput], { nullable: true })
    contents?: ItemContentInput[];

    @Field({ nullable: true })
    due?: Date;

    @Field({ nullable: true })
    deleted?: boolean;

    async validateInput(
        @Ctx() context: Context,
        current: DocumentType<Order>
    ): Promise<Order> {
        current.modified_by = context.base.modified_by;
        current.date_modified = context.base.date_modified;

        if (this.customer) {
            const customer = loaderResult(
                await CompanyLoader.load(this.customer.toString())
            );
            current.customer = customer._id;
        }

        if (this.vendor) {
            const vendor = loaderResult(
                await CompanyLoader.load(this.vendor.toString())
            );
            current.vendor = vendor._id;
        }

        if (this.due) current.due = this.due;

        if (this.contents) {
            current.contents = [];
            for (const content of this.contents) {
                current.contents.push(await content.validateItemContent());
            }
        }

        if (this.deleted !== undefined) current.deleted = this.deleted;

        return current;
    }
}
