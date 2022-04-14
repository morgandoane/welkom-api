import { UpdateVerificationInput } from './VerificationInput';
import { ObjectId } from 'mongoose';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { Context } from './../../auth/context';
import { createBaseResolver } from './../Base/BaseResolvers';
import {
    Verification,
    VerificationLoader,
    VerificationModel,
} from './Verification';
import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql';
import { loaderResult } from '@src/utils/loaderResult';
import { Permitted } from '@src/auth/middleware/Permitted';

const BaseResolver = createBaseResolver();

@Resolver(() => Verification)
export class VerificationResolvers extends BaseResolver {
    @UseMiddleware(Permitted())
    @Mutation(() => Verification)
    async updateVerification(
        @Ctx() context: Context,
        @Arg('id', () => ObjectIdScalar) id: ObjectId,
        @Arg('data', () => UpdateVerificationInput)
        data: UpdateVerificationInput
    ): Promise<Verification> {
        const verification = loaderResult(
            await VerificationLoader.load(id.toString())
        );

        VerificationLoader.clear(id.toString());

        const res = await VerificationModel.findByIdAndUpdate(
            id,
            data.serialize(context),
            { new: true }
        );

        VerificationLoader.prime(id.toString(), res);

        return res.toJSON() as unknown as Verification;
    }
}
