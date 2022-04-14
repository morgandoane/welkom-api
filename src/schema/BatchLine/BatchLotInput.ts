import { Ref } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { Batch } from '../Batch/Batch';
import { Lot } from '../Lot/Lot';
import { ObjectIdScalar } from '../ObjectIdScalar';
import { RecipeStep } from '../RecipeStep/RecipeStep';

@InputType()
export class BatchLotInput {
    @Field(() => ObjectIdScalar)
    batch: Ref<Batch>;

    @Field(() => ObjectIdScalar, { nullable: true })
    recipe_step?: Ref<RecipeStep>;

    @Field(() => ObjectIdScalar, { nullable: true })
    lot?: Ref<Lot>;
}
