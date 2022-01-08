import { VerificationModel } from './../Verification/Verification';
import { Verified } from './Verified';
import { createBaseResolver } from './../Base/BaseResolvers';
import { FieldResolver, Resolver, Root } from 'type-graphql';
import { Verification } from '../Verification/Verification';

const BaseResolver = createBaseResolver();

export const createVerifiedResolver = () => {
    @Resolver(() => Verified, { isAbstract: true })
    abstract class VerifiedResolver extends BaseResolver {
        @FieldResolver(() => Verification)
        async verification(
            @Root() { verification }: Verified
        ): Promise<Verification> {
            if (!verification) return null;
            const doc = await VerificationModel.findOne({
                _id: verification.toString(),
                deleted: false,
            });

            if (!doc) return null;
            return doc.toJSON();
        }
    }

    return VerifiedResolver;
};
