import { CompanyLoader } from './../Company/Company';
import { loaderResult } from './../../utils/loaderResult';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { ObjectId } from 'mongoose';
import { Context } from './../../auth/context';
import { Field, InputType } from 'type-graphql';
import { Itinerary } from './Itinerary';
import { DocumentType, mongoose } from '@typegoose/typegoose';

@InputType()
export class CreateItineraryInput {
    @Field()
    code: string;

    @Field(() => [String])
    orders: string[];

    @Field(() => ObjectIdScalar, { nullable: true })
    carrier?: ObjectId;

    async validateItinerary(context: Context): Promise<Itinerary> {
        const itinerary: Itinerary = {
            ...context.base,
            code: this.code,
            orders: this.orders.map((o) => new mongoose.Types.ObjectId(o)),
        };

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
    @Field(() => [String], { nullable: true })
    orders?: string[];

    @Field({ nullable: true })
    code?: string;

    @Field(() => ObjectIdScalar, { nullable: true })
    carrier?: ObjectId;

    @Field({ nullable: true })
    deleted?: boolean;

    async validateUpdate(
        context: Context,
        current: DocumentType<Itinerary>
    ): Promise<DocumentType<Itinerary>> {
        if (this.carrier !== undefined) {
            if (this.carrier) {
                const carrier = loaderResult(
                    await CompanyLoader.load(this.carrier.toString())
                );
                current.carrier = carrier._id;
            } else {
                current.carrier = undefined;
            }
        }
        if (this.deleted !== undefined) current.deleted = this.deleted;
        if (this.orders)
            current.orders = this.orders.map(
                (o) => new mongoose.Types.ObjectId(o)
            );

        current.date_modified = context.base.date_modified;
        current.modified_by = context.base.modified_by;

        return current;
    }
}
