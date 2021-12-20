import { Context } from './../../auth/context';
import { CompanyLoader } from './../Company/Company';
import { loaderResult } from './../../utils/loaderResult';
import {
    ItemContentInput,
    OrderContentInput,
} from './../Content/ContentInputs';
import { ObjectId } from 'mongoose';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { Ctx, Field, InputType } from 'type-graphql';
import { Order } from './Order';
import { DocumentType } from '@typegoose/typegoose';

@InputType()
export class CreateOrderInput {
    @Field()
    code: string;

    @Field(() => ObjectIdScalar, { nullable: true })
    customer?: ObjectId;

    @Field(() => ObjectIdScalar, { nullable: true })
    vendor?: ObjectId;

    @Field(() => [OrderContentInput])
    contents!: OrderContentInput[];

    async validateOrder(@Ctx() context: Context): Promise<Order> {
        const order: Order = { ...context.base, contents: [], code: this.code };
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

        for (const content of this.contents) {
            order.contents.push(await content.validateOrderContent());
        }

        return order;
    }
}

@InputType()
export class UpdateOrderInput {
    @Field({ nullable: true })
    code?: string;

    @Field(() => ObjectIdScalar, { nullable: true })
    customer?: ObjectId;

    @Field(() => ObjectIdScalar, { nullable: true })
    vendor?: ObjectId;

    @Field(() => [OrderContentInput], { nullable: true })
    contents?: OrderContentInput[];

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

        if (this.contents) {
            current.contents = [];
            for (const content of this.contents) {
                current.contents.push(await content.validateOrderContent());
            }
        }

        if (this.deleted !== undefined) current.deleted = this.deleted;

        return current;
    }
}
