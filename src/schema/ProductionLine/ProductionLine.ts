import { getBaseLoader } from '@src/schema/Loader';
import { Company } from '@src/schema/Company/Company';
import { Base } from '@src/schema/Base/Base';
import { prop, Ref, getModelForClass } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { Location } from '../Location/Location';

@ObjectType()
export class ProductionLine extends Base {
    @Field(() => String)
    @prop({ required: true })
    name!: string;

    @Field(() => Company)
    @prop({ required: true, ref: 'Company' })
    company!: Ref<Company>;

    @Field(() => Location)
    @prop({ required: true, ref: 'Location' })
    location!: Ref<Location>;
}

export const ProductionLineModel = getModelForClass(ProductionLine);
export const ProductionLineLoader = getBaseLoader(ProductionLineModel);
