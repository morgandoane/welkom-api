import { Context } from './../../auth/context';
import { RecipeSectionInput } from './../RecipeSection/RecipeSectionInput';
import { Ref } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { Recipe } from '../Recipe/Recipe';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { RecipeVersion } from './RecipeVersion';

@InputType()
export class CreateRecipeVersionInput {
    @Field(() => ObjectIdScalar)
    recipe!: Ref<Recipe>;

    @Field(() => [RecipeSectionInput])
    sections!: RecipeSectionInput[];

    @Field(() => [String])
    parameters!: string[];

    public async validateRecipeVersion(
        context: Context
    ): Promise<RecipeVersion> {
        const res: RecipeVersion = {
            ...context.base,
            parameters: this.parameters,
            sections: [],
            recipe: this.recipe,
        };

        for (const section of this.sections) {
            res.sections.push(await section.validateRecipeSection());
        }

        return res;
    }
}
