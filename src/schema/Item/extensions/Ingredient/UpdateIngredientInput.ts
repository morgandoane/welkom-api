import { Ingredient, IngredientUnitClass } from './Ingredient';
import { Field, InputType } from 'type-graphql';
import { UpdateItemInput } from '../../UpdateItemInput';

@InputType()
export class UpdateIngredientInput extends UpdateItemInput {
    @Field({ nullable: true })
    per_base_unit?: number;

    @Field(() => IngredientUnitClass, { nullable: true })
    unit_class?: IngredientUnitClass;

    public async serializeIngredientUpdate(): Promise<Partial<Ingredient>> {
        const res: Partial<Ingredient> = { ...(await this.serializeItem()) };

        if (this.per_base_unit) res.per_base_unit = this.per_base_unit;
        if (this.unit_class) res.unit_class = this.unit_class;

        return res;
    }
}
