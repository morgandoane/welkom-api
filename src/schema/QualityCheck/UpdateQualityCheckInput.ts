import { Ref } from '@typegoose/typegoose';
import { ObjectIdScalar } from './../ObjectIdScalar/ObjectIdScalar';
import { Field, InputType } from 'type-graphql';
import { NamesInput } from '../Names/NamesInput';
import { NumberRangeInput } from '../Range/NumberRange/NumberRangeInput';
import {
    QualityCheck,
    QualityCheckCategory,
    QualityCheckClass,
    QualityCheckOptionInput,
} from './QualityCheck';
import { Item } from '../Item/Item';

@InputType()
export class UpdateQualityCheckInput {
    @Field(() => Boolean, { nullable: true })
    deleted?: boolean;

    @Field(() => QualityCheckCategory, { nullable: true })
    quality_check_category?: QualityCheckCategory;

    @Field(() => ObjectIdScalar, { nullable: true })
    item?: Ref<Item> | null;

    @Field(() => QualityCheckClass, { nullable: true })
    quality_check_class?: QualityCheckClass;

    @Field({ nullable: true })
    required?: boolean;

    @Field(() => NamesInput, { nullable: true })
    prompt?: NamesInput;

    @Field(() => NamesInput, { nullable: true })
    help?: NamesInput | null;

    @Field(() => NumberRangeInput, { nullable: true })
    number_range?: NumberRangeInput | null;

    @Field(() => [QualityCheckOptionInput], { nullable: true })
    options?: QualityCheckOptionInput[] | null;

    public async serializeQualityCheckUpdate(): Promise<Partial<QualityCheck>> {
        const res: Partial<QualityCheck> = {};

        if (this.deleted !== null && this.deleted !== undefined)
            res.deleted = this.deleted;
        if (this.quality_check_category)
            res.quality_check_category = this.quality_check_category;
        if (this.item !== undefined) res.item = this.item;
        if (this.quality_check_class)
            res.quality_check_class = this.quality_check_class;
        if (this.required !== null && this.required !== undefined)
            res.required = this.required;
        if (this.prompt) res.prompt = this.prompt;
        if (this.help !== undefined) res.help = this.help;
        if (this.number_range !== undefined)
            res.number_range = this.number_range;
        if (this.options !== undefined) res.options = this.options;

        return res;
    }
}
