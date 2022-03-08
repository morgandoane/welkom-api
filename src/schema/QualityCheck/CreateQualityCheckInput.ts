import { NumberRangeInput } from './../Range/NumberRange/NumberRangeInput';
import { NamesInput } from './../Names/NamesInput';
import { Context } from '@src/auth/context';
import { Field, InputType } from 'type-graphql';
import {
    QualityCheck,
    QualityCheckCategory,
    QualityCheckClass,
    QualityCheckOptionInput,
} from './QualityCheck';
import { Ref } from '@typegoose/typegoose';
import { Item } from '../Item/Item';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';

@InputType()
export class CreateQualityCheckInput {
    @Field(() => ObjectIdScalar, { nullable: true })
    item!: Ref<Item> | null;

    @Field(() => QualityCheckCategory)
    quality_check_category!: QualityCheckCategory;

    @Field(() => QualityCheckClass)
    quality_check_class!: QualityCheckClass;

    @Field()
    required!: boolean;

    @Field(() => NamesInput)
    prompt!: NamesInput;

    @Field(() => NamesInput, { nullable: true })
    help!: NamesInput | null;

    @Field(() => NumberRangeInput, { nullable: true })
    number_range!: NumberRangeInput | null;

    @Field(() => [QualityCheckOptionInput], { nullable: true })
    options!: QualityCheckOptionInput[] | null;

    public async validateQualityCheck(context: Context): Promise<QualityCheck> {
        return {
            ...context.base,
            ...this,
        };
    }
}
