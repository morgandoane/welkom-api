import { Context } from '@src/auth/context';
import { Ref } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { Recipe } from '../Recipe/Recipe';
import { Folder } from '../Folder/Folder';
import { Item } from '../Item/Item';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';

@InputType()
export class CreateRecipeInput {
    @Field()
    name!: string;

    @Field(() => ObjectIdScalar)
    item!: Ref<Item>;

    @Field(() => ObjectIdScalar, { nullable: true })
    folder!: Ref<Folder> | null;

    public async validateRecipe(context: Context): Promise<Recipe> {
        return {
            ...context.base,
            ...this,
        };
    }
}
