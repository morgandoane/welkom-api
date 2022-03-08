import { HoldResolutionInput } from './../HoldResolution/HoldResolutionInput';
import { Context } from '@src/auth/context';
import { Field, InputType } from 'type-graphql';
import { Hold } from './Hold';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { Ref } from '@typegoose/typegoose';
import { Lot } from '../Lot/Lot';

@InputType()
export class CreateHoldInput {
    @Field()
    reason!: string;

    @Field()
    propagating!: boolean;

    @Field(() => [ObjectIdScalar])
    lots!: Ref<Lot>[];

    @Field(() => HoldResolutionInput, { nullable: true })
    resolution!: HoldResolutionInput | null;

    public async validateHold(context: Context): Promise<Hold> {
        return {
            ...context.base,
            ...this,
            resolution: this.resolution
                ? {
                      ...context.base,
                      ...this.resolution,
                  }
                : null,
        };
    }
}
