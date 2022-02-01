import { getBaseLoader } from '@src/utils/baseLoader';
import { NumberRange } from '../Range/NumberRange/NumberRange';
import { Names } from '../Names/Names';
import { Base } from '@src/schema/Base/Base';
import { modelOptions, prop, getModelForClass } from '@typegoose/typegoose';
import { Field, ObjectType, InputType } from 'type-graphql';

export enum QualityCheckClass {
    Boolean = 'Boolean',
    Date = 'Date',
    Number = 'Number',
    Options = 'Options',
    Text = 'Text',
}

export enum QualityCheckCategory {
    Production = 'Production',
    Receipt = 'Receipt',
    Shipment = 'Shipment',
}

@ObjectType()
export class QualityCheckOption {
    @Field()
    @prop({ required: true })
    value!: string;

    @Field()
    @prop({ required: true })
    acceptable!: boolean;
}

@InputType()
export class QualityCheckOptionInput {
    @Field()
    @prop({ required: true })
    value!: string;

    @Field()
    @prop({ required: true })
    acceptable!: boolean;
}

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'qualitychecks',
    },
})
export class QualityCheck extends Base {
    @Field(() => QualityCheckCategory)
    @prop({ required: true, enum: QualityCheckCategory })
    quality_check_category!: QualityCheckCategory;

    @Field(() => QualityCheckClass)
    @prop({ required: true, enum: QualityCheckClass })
    quality_check_class!: QualityCheckClass;

    @Field()
    @prop({ required: true })
    required!: boolean;

    @Field(() => Names)
    @prop({ required: true })
    prompt!: Names;

    @Field(() => Names, { nullable: true })
    @prop({ required: false })
    help!: Names | null;

    @Field(() => NumberRange, { nullable: true })
    @prop({ required: false })
    number_range!: NumberRange | null;

    @Field(() => [QualityCheckOption], { nullable: true })
    @prop({ required: false, type: () => QualityCheckOption })
    options!: QualityCheckOption[] | null;
}

export const QualityCheckModel = getModelForClass(QualityCheck);
export const QualityCheckLoader = getBaseLoader(QualityCheckModel);
