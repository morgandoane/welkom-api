import { Unit } from '../Unit/Unit';
import { modelOptions, prop, Ref, Severity } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { ObjectId } from 'mongoose';

@ObjectType()
@modelOptions({
    options: {
        allowMixed: Severity.ALLOW,
    },
})
export class Content {
    @Field()
    @prop({ required: true })
    quantity!: number;

    @Field(() => Unit)
    @prop({ required: true, ref: () => Unit })
    unit!: Ref<Unit> | ObjectId;
}
