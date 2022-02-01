import { CompanyLoader } from './../Company/Company';
import { Appointment } from './Appointment';
import { Ref } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { Company } from '../Company/Company';
import { Location } from '../Location/Location';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { getId } from '@src/utils/getId';

@InputType()
export class AppointmentInput {
    @Field()
    date!: Date;

    @Field()
    time_sensitive!: boolean;

    @Field(() => ObjectIdScalar)
    company!: Ref<Company>;

    @Field(() => ObjectIdScalar, { nullable: true })
    location!: Ref<Location> | null;

    public async validateAppointment(): Promise<Appointment> {
        const company = await CompanyLoader.load(this.company.toString(), true);
        const location = !this.location
            ? null
            : await CompanyLoader.load(this.company.toString(), true);

        return {
            ...getId(),
            ...this,
            company: company._id,
            location: location ? location._id : null,
        };
    }
}
