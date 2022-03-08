import { AppointmentInput } from '../Appointment/AppointmentInput';
import { BolContentInput } from '../BolContent/BolContentInput';
import { Field, InputType } from 'type-graphql';
import { Bol } from './Bol';

@InputType()
export class UpdateBolInput {
    @Field({ nullable: true })
    deleted?: boolean;

    @Field({ nullable: true })
    code?: string | null;

    @Field(() => [BolContentInput], { nullable: true })
    contents?: BolContentInput[];

    @Field(() => AppointmentInput, { nullable: true })
    from?: AppointmentInput;

    @Field(() => AppointmentInput, { nullable: true })
    to?: AppointmentInput;

    public async serializeBolUpdate(): Promise<Partial<Bol>> {
        const bol: Partial<Bol> = {};

        if (this.code !== undefined) bol.code = this.code;
        if (this.deleted !== undefined && this.deleted !== null)
            bol.deleted = this.deleted;
        if (this.contents) {
            bol.contents = [];
            for (const content of this.contents) {
                bol.contents.push(await content.validateBolContentInput());
            }
        }
        if (this.from) {
            bol.from = await this.from.validateAppointment();
        }
        if (this.to) {
            bol.to = await this.to.validateAppointment();
        }

        return bol;
    }
}