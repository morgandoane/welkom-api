import { Item, ItemLoader } from '@src/schema/Item/Item';
import {
    ProductionLine,
    ProductionLineLoader,
} from './../ProductionLine/ProductionLine';
import { loaderResult } from '@src/utils/loaderResult';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { ObjectId } from 'mongoose';
import {
    RecipeVersion,
    RecipeVersionLoader,
} from './../RecipeVersion/RecipeVersion';
import { Paginate } from './../Paginate';
import { BatchFilter } from './BatchFilter';
import { BatchList } from './BatchList';
import { MixingCardModel } from './../MixingCard/MixingCard';
import {
    ProceduralLot,
    ProceduralLotLoader,
    ProceduralLotModel,
} from './../Lot/extensions/ProceduralLot/ProceduralLot';
import { CreateBatchInput } from './CreateBatchInput';
import { Context } from './../../auth/context';
import { Permitted } from '@src/auth/middleware/Permitted';
import { createBaseResolver } from './../Base/BaseResolvers';
import { Batch, BatchModel, BatchLoader } from './Batch';
import {
    Arg,
    Ctx,
    FieldResolver,
    Mutation,
    Query,
    Resolver,
    Root,
    UseMiddleware,
} from 'type-graphql';
import { Permission } from '@src/auth/permissions';
import { UserInputError } from 'apollo-server-errors';
import { RecipeLoader } from '../Recipe/Recipe';
import { Location, LocationLoader } from '../Location/Location';

export const BaseResolvers = createBaseResolver();

@Resolver(() => Batch)
export class BatchResolvers extends BaseResolvers {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetBatches })
    )
    @Query(() => BatchList)
    async batches(@Arg('filter') filter: BatchFilter): Promise<BatchList> {
        return await Paginate.paginate({
            model: BatchModel,
            query: filter.serializeBatchFilter(),
            skip: filter.skip,
            take: filter.take,
            sort: { date_created: -1 },
        });
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetBatches })
    )
    @Query(() => Batch)
    async batch(@Arg('id', () => ObjectIdScalar) id: ObjectId): Promise<Batch> {
        return loaderResult(await BatchLoader.load(id.toString()));
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateBatch })
    )
    @Mutation(() => Batch)
    async createBatch(
        @Ctx() context: Context,
        @Arg('data') data: CreateBatchInput
    ): Promise<Batch> {
        const { lot, batch, card_update } = await data.validateBatchCreation(
            context
        );

        const lotDoc = await ProceduralLotModel.create(lot);
        const batchDoc = await BatchModel.create(batch);

        if (card_update) {
            await MixingCardModel.findByIdAndUpdate(
                card_update.id,
                card_update.update
            );
        }

        return batchDoc.toJSON() as unknown as Batch;
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateBatch })
    )
    @Mutation(() => Batch)
    async completeBatch(
        @Ctx() context: Context,
        @Arg('id', () => ObjectIdScalar) id: ObjectId
    ): Promise<Batch> {
        const batch = await BatchModel.findById(id.toString());

        const version = loaderResult(
            await RecipeVersionLoader.load(batch.recipe_version.toString())
        );

        const parentRecipe = loaderResult(
            await RecipeLoader.load(version.recipe.toString())
        );

        if (!batch)
            throw new UserInputError(
                `Failed to find batch with id ${id.toString()}`
            );

        batch.date_completed = new Date();

        await batch.save();

        const card = await MixingCardModel.findOne({
            profile: context.base.created_by,
            deleted: false,
        });

        const match = card.lines.find(
            (line) =>
                line.recipe.toString() == parentRecipe.toString() &&
                (line.recipe_version
                    ? line.recipe_version.toString() == version._id.toString()
                    : true)
        );

        if (card && match) {
            const updateIndex = card.lines
                .map((l) => l._id.toString())
                .indexOf(match._id.toString());

            if (updateIndex !== -1) {
                if (
                    card.lines[updateIndex].limit !== undefined &&
                    card.lines[updateIndex].limit !== null
                ) {
                    if (card.lines[updateIndex].limit == 1) {
                        card.lines = card.lines.splice(updateIndex, 1);
                    } else {
                        card.lines[updateIndex].limit =
                            card.lines[updateIndex].limit - 1;
                    }

                    await card.save();
                }
            }
        }

        BatchLoader.clear(batch._id.toString());

        return batch.toJSON() as unknown as Batch;
    }

    @FieldResolver(() => ProceduralLot)
    async lot(@Root() { lot }: Batch): Promise<ProceduralLot> {
        return loaderResult(await ProceduralLotLoader.load(lot.toString()));
    }

    @FieldResolver(() => Item)
    async item(@Root() { item }: Batch): Promise<Item> {
        return loaderResult(await ItemLoader.load(item.toString()));
    }

    @FieldResolver(() => Location)
    async location(@Root() { location }: Batch): Promise<Location> {
        return loaderResult(await LocationLoader.load(location.toString()));
    }

    @FieldResolver(() => ProductionLine, { nullable: true })
    async production_line(
        @Root() { production_line }: Batch
    ): Promise<ProductionLine> {
        if (!production_line) return null;
        return loaderResult(
            await ProductionLineLoader.load(production_line.toString())
        );
    }

    @FieldResolver(() => RecipeVersion)
    async recipe_version(
        @Root() { recipe_version }: Batch
    ): Promise<RecipeVersion> {
        return loaderResult(
            await RecipeVersionLoader.load(recipe_version.toString())
        );
    }
}
