import { CompanyLoader } from './../Company/Company';
import { loaderResult } from './../../utils/loaderResult';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { ObjectId } from 'mongoose';
import { Context } from './../../auth/context';
import { CreateBolInput } from './../Bol/BolInput';
import { ConfiguredInput } from './../Configured/ConfiguredInput';
import { Field, InputType } from 'type-graphql';
import { Itinerary } from './Itinerary';

@InputType()
export class CreateItineraryInput extends ConfiguredInput {
    @Field(() => [CreateBolInput])
    bols!: CreateBolInput[];

    @Field(() => ObjectIdScalar, { nullable: true })
    carrier?: ObjectId;

    async validateItinerary(context: Context): Promise<Itinerary> {
        const configured = await this.validate(context);

        const itinerary: Itinerary = { ...configured, bols: [] };

        if (this.carrier) {
            const carrier = loaderResult(
                await CompanyLoader.load(this.carrier.toString())
            );

            itinerary.carrier = carrier._id;
        }

        for (const bol of this.bols) {
            itinerary.bols.push(await bol.validateBol(context));
        }

        return itinerary;
    }
}
