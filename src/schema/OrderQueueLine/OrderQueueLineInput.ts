import { ObjectIdScalar } from '@src/schema/ObjectIdScalar/ObjectIdScalar';
import { UnitLoader } from './../Unit/Unit';
import { ItemLoader } from '@src/schema/Item/Item';
import { LocationLoader } from './../Location/Location';
import { CompanyLoader } from '../Company/Company';
import { Company } from '@src/schema/Company/Company';
import { Location } from '@src/schema/Location/Location';
import { Ref } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { OrderQueueLine } from './OrderQueueLine';
import { Item } from '../Item/Item';
import { Unit } from '../Unit/Unit';

@InputType()
export class OrderQueueLineInput {
    @Field({ nullable: true })
    po!: string | null;

    @Field(() => ObjectIdScalar, { nullable: true })
    customer!: Ref<Company> | null;

    @Field(() => ObjectIdScalar, { nullable: true })
    vendor!: Ref<Company> | null;

    @Field(() => ObjectIdScalar, { nullable: true })
    destination!: Ref<Location> | null;

    @Field(() => ObjectIdScalar, { nullable: true })
    item!: Ref<Item> | null;

    @Field(() => ObjectIdScalar, { nullable: true })
    unit!: Ref<Unit> | null;

    @Field({ nullable: true })
    quantity!: number | null;

    @Field({ nullable: true })
    date!: Date | null;

    @Field({ nullable: true, description: 'Number of minutes past midnight' })
    time!: number | null;

    public async validateOrderQueueLineInput(): Promise<OrderQueueLine> {
        const res = new OrderQueueLine();

        if (this.po !== undefined) res.po = this.po;

        if (this.customer) {
            const customer = await CompanyLoader.load(this.customer, true);
            res.customer = customer._id;
        }

        if (this.vendor) {
            const vendor = await CompanyLoader.load(this.vendor, true);
            res.vendor = vendor._id;
        }

        if (this.destination) {
            const destination = await LocationLoader.load(
                this.destination,
                true
            );
            res.destination = destination._id;
        }

        if (this.item) {
            const item = await ItemLoader.load(this.item, true);
            res.item = item._id;
        }

        if (this.unit) {
            const unit = await UnitLoader.load(this.unit, true);
            res.unit = unit._id;
        }

        if (this.quantity) res.quantity = this.quantity;
        if (this.date) res.date = this.date;
        if (this.time) res.time = this.time;

        return res;
    }
}
