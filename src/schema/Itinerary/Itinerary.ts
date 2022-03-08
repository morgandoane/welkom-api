import { Expensed } from './../Expensed/Expensed';
import { getModelForClass, prop, Ref } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { getBaseLoader } from '@src/utils/baseLoader';
import { Company } from '../Company/Company';

@ObjectType()
export class Itinerary extends Expensed {
    @Field({ nullable: true })
    @prop({ required: false })
    code!: string | null;

    @Field(() => Company, { nullable: true })
    @prop({ required: false, ref: () => Company })
    carrier!: Ref<Company> | null;

    @Field(() => Company)
    @prop({ required: true, ref: () => Company })
    commissioned_by!: Ref<Company>;
}

export const ItineraryModel = getModelForClass(Itinerary);
export const ItineraryLoader = getBaseLoader(ItineraryModel);
