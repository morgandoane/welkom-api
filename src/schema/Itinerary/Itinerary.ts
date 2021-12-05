import { Field, ObjectType } from 'type-graphql';
import { Bol } from '../Bol/Bol';
import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
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
}

export const ItineraryModel = getModelForClass(Itinerary);
