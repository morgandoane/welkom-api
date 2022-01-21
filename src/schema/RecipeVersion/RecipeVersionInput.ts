import { loaderResult } from './../../utils/loaderResult';
import { RecipeLoader } from './../Recipe/Recipe';
import { Context } from './../../auth/context';
import { RecipeVersion } from './RecipeVersion';
import { RecipeSectionInput } from './../RecipeStep/RecipeStepInput';
import { Field, InputType } from 'type-graphql';

@InputType()
export class RecipeVersionInput {
    @Field()
    recipe!: string;

    @Field(() => [RecipeSectionInput])
    sections!: RecipeSectionInput[];

    @Field(() => [String])
    parameters!: string[];

    @Field()
    base_units_produced!: number;

    @Field({ nullable: true })
    note?: string;

    public async validateRecipeVersion({
        base,
    }: Context): Promise<RecipeVersion> {
        const recipe = loaderResult(await RecipeLoader.load(this.recipe));

        const res: RecipeVersion = {
            ...base,
            recipe: recipe._id,
            sections: [],
            parameters: this.parameters,
            base_units_produced: this.base_units_produced,
            note: this.note,
        };

        for (const section of this.sections) {
            res.sections.push(await section.validateRecipeSection());
        }

        return res;
    }
}
