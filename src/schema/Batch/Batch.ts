import { RecipeVersion } from './../RecipeVersion/RecipeVersion';
import { Base } from './../Base/Base';
import { modelOptions, prop, Ref } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'batches',
    },
})
export class Batch extends Base {
    @Field(() => RecipeVersion)
    @prop({ required: true, ref: () => RecipeVersion })
    recipe_version!: Ref<RecipeVersion>;
}
