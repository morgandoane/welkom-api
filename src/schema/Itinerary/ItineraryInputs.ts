import { CompanyLoader } from './../Company/Company';
import { loaderResult } from './../../utils/loaderResult';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { ObjectId } from 'mongoose';
import { Context } from './../../auth/context';
import { Field, InputType } from 'type-graphql';
import { Itinerary } from './Itinerary';
import { DocumentType } from '@typegoose/typegoose';

@InputType()
export class CreateItineraryInput {
    @Field(() => ObjectIdScalar, { nullable: true })
    carrier?: ObjectId;

    async validateItinerary(context: Context): Promise<Itinerary> {
        const itinerary: Itinerary = { ...context.base, bols: [] };

        if (this.carrier) {
            const carrier = loaderResult(
                await CompanyLoader.load(this.carrier.toString())
            );

            itinerary.carrier = carrier._id;
        }

        return itinerary;
    }
}

@InputType()
export class UpdateItineraryInput {
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
        if (this.deleted !== undefined) current.deleted = this.deleted;

        current.date_modified = context.base.date_modified;
        current.modified_by = context.base.modified_by;

        return current;
    }
}
