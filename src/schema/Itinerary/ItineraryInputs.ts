import { CompanyLoader } from './../Company/Company';
import { loaderResult } from './../../utils/loaderResult';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { ObjectId, UpdateQuery } from 'mongoose';
import { Context } from './../../auth/context';
import { CreateBolInput } from './../Bol/BolInput';
import { ConfiguredInput } from './../Configured/ConfiguredInput';
import { Field, InputType } from 'type-graphql';
import { Itinerary } from './Itinerary';
import { DocumentType } from '@typegoose/typegoose';

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

@InputType()
export class UpdateItineraryInput extends ConfiguredInput {
    @Field(() => ObjectIdScalar, { nullable: true })
    carrier?: ObjectId;

    @Field({ nullable: true })
    deleted?: boolean;

    async validateUpdate(
        context: Context,
        current: DocumentType<Itinerary>
    ): Promise<DocumentType<Itinerary>> {
        if (this.carrier) {
            const carrier = loaderResult(
                await CompanyLoader.load(this.carrier.toString())
            );
            current.carrier = carrier._id;
        }
        const configured = await this.validate(context);
        current.field_values = configured.field_values;
        current.config = configured.config;
        current.date_modified = configured.date_modified;
        current.modified_by = configured.modified_by;
        if (this.deleted !== undefined) current.deleted = this.deleted;
        return current;
    }
}
