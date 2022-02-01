import { Field, InputType } from 'type-graphql';
import { RecipeVersion } from './RecipeVersion';

@InputType()
export class UpdateRecipeVersionInput {
    @Field(() => Boolean, { nullable: true })
    deleted?: boolean;

    @Field(() => [String], { nullable: true })
    parameters?: string[];

    public async serializeRecipeVersionUpdate(): Promise<
        Partial<RecipeVersion>
    > {
        const res: Partial<RecipeVersion> = {};

        if (this.parameters) {
            res.parameters = this.parameters;
        }

        if (this.deleted !== null && this.deleted !== undefined) {
            res.deleted = this.deleted;
        }

        return res;
    }
}
