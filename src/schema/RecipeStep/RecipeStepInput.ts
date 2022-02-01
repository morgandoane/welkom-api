import { NamesInput } from './../Names/NamesInput';
import { Field, InputType } from 'type-graphql';
import { RecipeStepContentInput } from '../RecipeStepContent/RecipeStepContentInput';
import { RecipeStep } from './RecipeStep';
import { getId } from '@src/utils/getId';

@InputType()
export class RecipeStepInput {
    @Field(() => NamesInput, { nullable: true })
    instruction!: NamesInput | null;

    @Field(() => RecipeStepContentInput, { nullable: true })
    content!: RecipeStepContentInput | null;

    public async validateRecipeStep(): Promise<RecipeStep> {
        const res: RecipeStep = {
            ...getId(),
            instruction: this.instruction,
            content: await this.content.validateRecipeStepContent(),
        };

        return res;
    }
}
