import { Field, ObjectType } from 'type-graphql';
import { getModelForClass, prop } from '@typegoose/typegoose';
import { Base } from '../Base/Base';

export enum UnitClass {
    Count = 'Count',
    Time = 'Time',
    Volume = 'Volume',
    Weight = 'Weight',
}

@ObjectType()
export class Unit extends Base {
    @Field(() => UnitClass)
    @prop({ required: true, enum: UnitClass })
    class!: UnitClass;

    @Field()
    @prop({ required: true })
    english!: string;

    @Field({ nullable: true })
    @prop({ required: false })
    spanish?: string;

    @Field({ nullable: true })
    @prop({ required: false })
    english_plural?: string;

    @Field({ nullable: true })
    @prop({ required: false })
    spanish_plural?: string;
}

export const UnitModel = getModelForClass(Unit);
