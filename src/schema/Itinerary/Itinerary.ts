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
import { Configured } from '../Configured/Configured';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'itineraries',
    },
})
export class Itinerary extends Configured {
    @Field(() => [Bol])
    @prop({ required: true, type: () => Bol })
    bols: Bol[];

    @Field(() => Company, { nullable: true })
    @prop({ required: false, ref: () => Company })
    carrier?: Ref<Company>;
}

export const ItineraryModel = getModelForClass(Itinerary);

export const ItineraryLoader = getBaseLoader(ItineraryModel);
