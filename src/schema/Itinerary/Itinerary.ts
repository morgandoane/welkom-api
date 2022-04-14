import { Base } from './../Base/Base';
import { getBaseLoader } from './../Loader';
import { Company } from './../Company/Company';
import { Field, ObjectType } from 'type-graphql';
import { Bol } from '../Bol/Bol';
import {
    getModelForClass,
    modelOptions,
    prop,
    Ref,
} from '@typegoose/typegoose';
import { ObjectId } from 'mongoose';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'itineraries',
    },
})
export class Itinerary extends Base {
    @Field()
    @prop({ required: true })
    code!: string;

    @prop({ required: true, ref: 'Order' })
    orders!: ObjectId[];

    @Field(() => [Bol])
    bols?: Bol[];

    @Field(() => Company, { nullable: true })
    @prop({ required: false, ref: () => Company })
    carrier?: Ref<Company> | ObjectId;
}

export const ItineraryModel = getModelForClass(Itinerary);

export const ItineraryLoader = getBaseLoader(ItineraryModel);
