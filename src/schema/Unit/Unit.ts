import { getBaseLoader } from '@src/utils/baseLoader';
import { NamesPlural } from './../Names/Names';
import { Base } from '@src/schema/Base/Base';
import { Field, ObjectType } from 'type-graphql';
import { prop, getModelForClass } from '@typegoose/typegoose';
import { UnitClass } from './UnitClass';
import { Min } from 'class-validator';

@ObjectType()
export class Unit extends Base {
    @Field(() => NamesPlural)
    @prop({ required: true })
    names!: NamesPlural;

    @Field(() => UnitClass)
    @prop({ required: true, enum: UnitClass })
    unit_class!: UnitClass;

    @Min(0)
    @Field()
    @prop({ required: true, min: 0 })
    to_base_unit!: number;
}

export const UnitModel = getModelForClass(Unit);
export const UnitLoader = getBaseLoader(UnitModel);
