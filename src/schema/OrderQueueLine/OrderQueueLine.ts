import {
    CodeGenerator,
    CodeType,
} from './../../services/CodeGeneration/CodeGeneration';
import { CompanyLoader } from './../Company/Company';
import { UnitClass } from './../Unit/UnitClass';
import { Unit, UnitLoader } from './../Unit/Unit';
import { Item, ItemLoader } from '@src/schema/Item/Item';
import { Itinerary } from './../Itinerary/Itinerary';
import { OrderAppointment } from './../OrderAppointment/OrderAppointment';
import { Context } from '@src/auth/context';
import { UserInputError } from 'apollo-server-core';
import { Bol } from './../Bol/Bol';
import { Order } from './../Order/Order';
import { Company } from '@src/schema/Company/Company';
import { prop, Ref } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { getId } from '@src/utils/getId';
import { Location } from '../Location/Location';
import { setHours, setMinutes } from 'date-fns';
import { BaseUnit } from '../Unit/BaseUnit';

@ObjectType()
export class OrderQueueLine {
    @Field({ nullable: true })
    @prop({ required: false })
    po!: string | null;

    @Field(() => String, { nullable: true })
    @prop({ required: false, ref: () => Company })
    customer!: Ref<Company> | null;

    @Field(() => String, { nullable: true })
    @prop({ required: false, ref: () => Company })
    vendor!: Ref<Company> | null;

    @Field(() => String, { nullable: true })
    @prop({ required: false, ref: () => Location })
    destination!: Ref<Location> | null;

    @Field(() => String, { nullable: true })
    @prop({ required: false, ref: () => Item })
    item!: Ref<Item> | null;

    @Field(() => String, { nullable: true })
    @prop({ required: false, ref: () => Unit })
    unit!: Ref<Unit> | null;

    @Field({ nullable: true })
    @prop({ required: false })
    quantity!: number | null;

    @Field({ nullable: true })
    @prop({ required: false })
    date!: Date | null;

    @Field({ nullable: true, description: 'Number of minutes past midnight' })
    @prop({ required: false })
    time!: number | null;

    public async processQueueLine(
        context: Context
    ): Promise<{ order: Order; bols: Bol[]; itineraries: Itinerary[] }> {
        if (!this.po) throw new UserInputError('Queue line requires a PO');
        if (!this.customer)
            throw new UserInputError('Queue line requires a customer');
        if (!this.vendor)
            throw new UserInputError('Queue line requires a vendor');
        if (!this.destination)
            throw new UserInputError('Queue line requires a destination');
        if (!this.item) throw new UserInputError('Queue line requires an item');
        if (!this.unit) throw new UserInputError('Queue line requires a unit');
        if (!this.quantity)
            throw new UserInputError('Queue line requires a quantity');
        if (!this.date) throw new UserInputError('Queue line requires a date');

        const order: Order = {
            ...context.base,
            po: this.po,
            customer: this.customer,
            vendor: this.vendor,
            appointments: [],
        };

        const bols: Bol[] = [];
        const itineraries: Itinerary[] = [];

        let dateVal = this.date;

        if (this.time) {
            const hours = this.time % 60;
            const minutes = this.time - (this.time % 60);
            dateVal = setMinutes(dateVal, minutes);
            dateVal = setHours(dateVal, hours);
        }

        const unit = await UnitLoader.load(this.unit, true);
        const item = await ItemLoader.load(this.item, true);

        if (
            item.base_unit == BaseUnit.Count &&
            unit.unit_class !== UnitClass.Count
        )
            throw new UserInputError(
                'Cannot convert between count and weight/volume.'
            );

        const orderAppointment: OrderAppointment = {
            contents: [
                {
                    client_unit: this.unit,
                    quantity:
                        this.quantity * unit.to_base_unit * item.per_base_unit,
                    client_quantity: this.quantity,
                    item: this.item,
                },
            ],
            date: dateVal,
            location: this.destination,
            ...context.base,
        };

        order.appointments.push(orderAppointment);

        const bol: Bol = {
            ...context.base,
            itinerary: null,
            code: '',
            contents: [],
            from: {
                ...getId(),
                date: dateVal,
                company: order.vendor,
                location: null,
                time: this.time,
            },
            to: orderAppointment._id,
        };

        const fromCompany = await CompanyLoader.load(order.vendor, true);

        if (fromCompany.internal == true) {
            // intenral order, create an itinerary
            const itinerary: Itinerary = {
                ...context.base,
                expenses: [],
                carrier: fromCompany._id,
                code: await CodeGenerator.generate(CodeType.ITIN),
            };

            itineraries.push(itinerary);
        }

        bols.push(bol);

        return { order, bols, itineraries };
    }
}
