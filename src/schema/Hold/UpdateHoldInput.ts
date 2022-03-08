import { Context } from '@src/auth/context';
import { Ref } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { HoldResolutionInput } from '../HoldResolution/HoldResolutionInput';
import { Lot } from '../Lot/Lot';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { Hold } from './Hold';

@InputType()
export class UpdateHoldInput {
    @Field({ nullable: true })
    reason?: string;

    @Field({ nullable: true })
    propagating?: boolean;

    @Field(() => [ObjectIdScalar], { nullable: true })
    lots?: Ref<Lot>[];

    @Field(() => HoldResolutionInput, { nullable: true })
    resolution?: HoldResolutionInput | null;

    public async serializeHoldUpdate(context: Context): Promise<Partial<Hold>> {
        const res: Partial<Hold> = {};

        if (this.reason) res.reason = this.reason;
        if (this.propagating !== null && this.propagating !== undefined)
            res.propagating = this.propagating;
        if (this.lots) res.lots = this.lots;
        if (this.resolution !== undefined)
            res.resolution =
                this.resolution == null
                    ? null
                    : { ...this.resolution, ...context.base };

        return res;
    }
}
