import { RecipeStepInput } from './../RecipeStep/RecipeStepInput';
import { Field, InputType } from 'type-graphql';
import { RecipeSection } from './RecipeSection';
import { getId } from '@src/utils/getId';

@InputType()
export class RecipeSectionInput {
    @Field({ nullable: true })
    label!: string | null;

    @Field(() => [RecipeStepInput])
    steps!: RecipeStepInput[];

    public async validateRecipeSection(): Promise<RecipeSection> {
        const res: RecipeSection = {
            ...getId(),
            label: this.label,
            steps: [],
        };

        for (const step of this.steps) {
            res.steps.push(await step.validateRecipeStep());
        }

        return res;
    }
}
