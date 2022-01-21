import { mongoose } from '@typegoose/typegoose';
import {
    ItemContentInput,
    ItemPluralContentInput,
} from './../Content/ContentInputs';
import { Field, InputType } from 'type-graphql';
import { RecipeSection, RecipeStep } from './RecipeStep';

@InputType()
export class RecipeSectionInput {
    @Field({ nullable: true })
    label?: string;

    @Field(() => [RecipeStepInput])
    steps!: RecipeStepInput[];

    public async validateRecipeSection(): Promise<RecipeSection> {
        const res: RecipeSection = {
            _id: new mongoose.Types.ObjectId(),
            label: this.label,
            steps: [],
        };

        for (const step of this.steps) {
            res.steps.push(await step.validateRecipeStep());
        }

        return res;
    }
}

@InputType()
export class RecipeStepInput {
    @Field({ nullable: true })
    instruction?: string;

    @Field(() => ItemPluralContentInput, { nullable: true })
    content?: ItemPluralContentInput;

    public async validateRecipeStep(): Promise<RecipeStep> {
        return {
            _id: new mongoose.Types.ObjectId(),
            content: this.content
                ? await this.content.validateItemPluralContent()
                : null,
            instruction: this.instruction,
        };
    }
}
