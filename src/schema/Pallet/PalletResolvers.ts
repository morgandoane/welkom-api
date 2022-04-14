import {
    RecipeVersion,
    RecipeVersionLoader,
} from './../RecipeVersion/RecipeVersion';
import { Context } from '@src/auth/context';
import { CreatePalletInput } from './CreatePalletInput';
import { Permitted } from '@src/auth/middleware/Permitted';
import { ItemLoader } from '@src/schema/Item/Item';
import {
    BucketLotLoader,
    BucketLotModel,
} from './../Lot/extensions/BucketLot/BucketLot';
import { loaderResult } from '@src/utils/loaderResult';
import { Pallet, PalletModel } from './Pallet';
import {
    Arg,
    Ctx,
    FieldResolver,
    Mutation,
    Resolver,
    Root,
    UseMiddleware,
} from 'type-graphql';
import { Item } from '../Item/Item';
import { BucketLot } from '../Lot/extensions/BucketLot/BucketLot';
import { createBaseResolver } from './../Base/BaseResolvers';
import { LocationLoader, Location } from '../Location/Location';
import { Permission } from '@src/auth/permissions';

const BaseResolver = createBaseResolver();

@Resolver(() => Pallet)
export class PalletResolvers extends BaseResolver {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreatePallet })
    )
    @Mutation(() => Pallet)
    async createPallet(
        @Ctx() context: Context,
        @Arg('data', () => CreatePalletInput) data: CreatePalletInput
    ): Promise<Pallet> {
        const { pallet, lot } = await data.validatePallet(context);

        await BucketLotModel.create(lot);
        const palletRes = await PalletModel.create(pallet);

        return palletRes.toJSON() as unknown as Pallet;
    }

    @FieldResolver(() => BucketLot)
    async lot(@Root() { lot }: Pallet): Promise<BucketLot> {
        return loaderResult(await BucketLotLoader.load(lot.toString()));
    }

    @FieldResolver(() => Item)
    async item(@Root() { item }: Pallet): Promise<Item> {
        return loaderResult(await ItemLoader.load(item.toString()));
    }

    @FieldResolver(() => Location)
    async location(@Root() { location }: Pallet): Promise<Location> {
        return loaderResult(await LocationLoader.load(location.toString()));
    }

    @FieldResolver(() => RecipeVersion, { nullable: true })
    async recipe_version(
        @Root() { recipe_version }: Pallet
    ): Promise<RecipeVersion> {
        if (!recipe_version) return null;
        return loaderResult(
            await RecipeVersionLoader.load(recipe_version.toString())
        );
    }
}
