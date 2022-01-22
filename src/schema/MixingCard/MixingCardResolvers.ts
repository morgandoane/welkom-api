import { Profile } from './../Profile/Profile';
import { UserLoader } from './../../services/AuthProvider/AuthProvider';
import { Location, LocationLoader } from './../Location/Location';
import { ObjectId } from 'mongoose';
import { ObjectIdScalar } from './../ObjectIdScalar';
import {
    CreateMixingCardInput,
    UpdateMixingCardInput,
} from './MixingCardInputs';
import { Context } from './../../auth/context';
import { Permitted } from '@src/auth/middleware/Permitted';
import { MixingCard, MixingCardModel } from './../MixingCard/MixingCard';
import {
    Ctx,
    Query,
    UseMiddleware,
    Mutation,
    Arg,
    FieldResolver,
    Root,
    Resolver,
} from 'type-graphql';
import { createBaseResolver } from './../Base/BaseResolvers';
import { Permission } from '@src/auth/permissions';
import { loaderResult } from '@src/utils/loaderResult';

const BaseResolver = createBaseResolver();

@Resolver(() => MixingCard)
export class MixingCardResolvers extends BaseResolver {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetMixingCards })
    )
    @Query(() => [MixingCard])
    async mixingCards(): Promise<MixingCard[]> {
        const res = await MixingCardModel.find({ deleted: false });
        return res.map((doc) => doc.toJSON());
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetMixingCards })
    )
    @Query(() => MixingCard)
    async mixingCard(
        @Arg('id', () => ObjectIdScalar) id: ObjectId
    ): Promise<MixingCard> {
        const res = await MixingCardModel.findById(id.toString());
        return res.toJSON();
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetMixingCards })
    )
    @Query(() => MixingCard)
    async myMixingCard(@Ctx() context: Context): Promise<MixingCard> {
        const res = await MixingCardModel.findOne({
            deleted: false,
            profile: context.base.created_by,
        });
        if (!res) return null;
        else return res.toJSON();
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.CreateMixingCard,
        })
    )
    @Mutation(() => MixingCard)
    async createMixingCard(
        @Ctx() context: Context,
        @Arg('data') data: CreateMixingCardInput
    ): Promise<MixingCard> {
        const doc = await data.validateCard(context);
        const res = await MixingCardModel.create(doc);
        return res.toJSON();
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.UpdateMixingCard,
        })
    )
    @Mutation(() => MixingCard)
    async updateMixingCard(
        @Ctx() context: Context,
        @Arg('id', () => ObjectIdScalar) id: ObjectId,
        @Arg('data') data: UpdateMixingCardInput
    ): Promise<MixingCard> {
        const update = await data.validateCardUpdate(context);
        const res = await MixingCardModel.findByIdAndUpdate(
            id.toString(),
            update
        );

        return res.toJSON();
    }

    @FieldResolver(() => Location)
    async location(@Root() { location }: MixingCard): Promise<Location> {
        return loaderResult(await LocationLoader.load(location.toString()));
    }

    @FieldResolver(() => Profile)
    async profile(@Root() { profile }: MixingCard): Promise<Profile> {
        return loaderResult(await UserLoader.load(profile));
    }
}
