import { ObjectIdScalar } from '@src/schema/ObjectIdScalar/ObjectIdScalar';
import { Context } from '@src/auth/context';
import { LocationLoader } from './../Location/Location';
import { BolContentInput } from './../BolContent/BolContentInput';
import { Ref } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { OrderAppointment } from './OrderAppointment';
import { Location } from './../Location/Location';

@InputType()
export class OrderAppointmentInput {
    @Field(() => [BolContentInput])
    contents!: BolContentInput[];

    @Field()
    date!: Date;

    @Field(() => ObjectIdScalar, { nullable: true })
    location!: Ref<Location> | null;

    @Field({ nullable: true })
    time!: number | null;

    public async validateOrderAppointmentInput(
        context: Context
    ): Promise<OrderAppointment> {
        const location = await LocationLoader.load(this.location, true);

        return {
            ...context.base,
            date: this.date,
            location: this.location,
            time: this.time,
            contents: await Promise.all(
                this.contents.map((content) =>
                    content.validateBolContentInput()
                )
            ),
        };
    }
}
