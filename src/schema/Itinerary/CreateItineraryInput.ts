import { CompanyLoader } from './../Company/Company';
import { Context } from './../../auth/context';
import { Ref } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { Company } from '../Company/Company';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { Itinerary } from './Itinerary';

@InputType()
export class CreateItineraryInput {
    @Field({ nullable: true })
    code: string | null;

    @Field(() => ObjectIdScalar, { nullable: true })
    carrier!: Ref<Company> | null;

    @Field(() => ObjectIdScalar)
    commissioned_by!: Ref<Company>;

    public async validateItinerary(context: Context): Promise<Itinerary> {
        const commisionedBy = await CompanyLoader.load(
            this.commissioned_by,
            true
        );
        const carrier = this.carrier
            ? await CompanyLoader.load(this.carrier, true)
            : null;
        const res: Itinerary = {
            ...context.base,
            ...this,
            expense_summaries: [],
            expenses: [],
        };

        return res;
    }
}
