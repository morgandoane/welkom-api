import { LotModel, LotLoader } from './../Lot/Lot';
import { Paginate } from './../Pagination/Pagination';
import { BatchFilter } from './BatchFilter';
import { BatchList } from './BatchList';
import { Ref } from '@typegoose/typegoose';
import { Context } from '@src/auth/context';
import { CreateBatchInput } from './CreateBatchInput';
import { CompanyLoader } from './../Company/Company';
import { BatchLotLoader, BatchLotModel } from './../BatchLot/BatchLot';
import { ProductionLineLoader } from './../ProductionLine/ProductionLine';
import { createUploadEnabledResolver } from './../UploadEnabled/UploadEnabledResolvers';
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
import { Batch, BatchModel, BatchLoader } from './Batch';
import { BatchLot } from '../BatchLot/BatchLot';
import { Company } from '../Company/Company';
import { ProductionLine } from '../ProductionLine/ProductionLine';
import {
    RecipeVersion,
    RecipeVersionLoader,
} from '../RecipeVersion/RecipeVersion';
import { LocationLoader, Location } from '../Location/Location';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { UpdateBatchInput } from './UpdateBatchInput';

const UploadEnabledResolver = createUploadEnabledResolver();

@Resolver(() => Batch)
export class BatchResolvers extends UploadEnabledResolver {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetBatches })
    )
    @Query(() => BatchList)
    async batches(@Arg('filter') filter: BatchFilter): Promise<BatchList> {
        return await Paginate.paginate({
            model: BatchModel,
            query: await filter.serializeBatchFilter(),
            skip: filter.skip,
            take: filter.take,
            sort: { date_created: -1 },
        });
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetBatches })
    )
    @Query(() => Batch)
    async batch(
        @Arg('id', () => ObjectIdScalar) id: Ref<Batch>
    ): Promise<Batch> {
        return await BatchLoader.load(id, true);
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateBatch })
    )
    @Mutation(() => Batch)
    async createBatch(
        @Ctx() context: Context,
        @Arg('data', () => CreateBatchInput) data: CreateBatchInput
    ): Promise<Batch> {
        const { batch, lot } = await data.validateBatch(context);
        await BatchLotModel.create(lot);
        const batchRes = await BatchModel.create(batch);
        return batchRes;
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.UpdateBatch })
    )
    @Mutation(() => Batch)
    async updateBatch(
        @Arg('id', () => ObjectIdScalar) id: Ref<Batch>,
        @Arg('data', () => UpdateBatchInput) data: UpdateBatchInput
    ): Promise<Batch> {
        const { batch, lot } = await data.serializeBatchUpdate();

        const res = await BatchModel.findByIdAndUpdate(id, batch, {
            new: true,
        });

        const lotRes = await LotModel.findByIdAndUpdate(res.lot, lot, {
            new: true,
        });

        BatchLoader.clear(id);
        BatchLotLoader.clear(lotRes._id);
        LotLoader.clear(lotRes._id);

        return res;
    }

    @FieldResolver(() => RecipeVersion, { nullable: true })
    async recipe_version(@Root() batch: Batch): Promise<RecipeVersion> {
        if (!batch.recipe_version) return null;
        else return await RecipeVersionLoader.load(batch.recipe_version, true);
    }

    @FieldResolver(() => BatchLot)
    async lot(@Root() batch: Batch): Promise<BatchLot> {
        return await BatchLotLoader.load(batch.lot, true);
    }

    @FieldResolver(() => Location)
    async location(@Root() batch: Batch): Promise<Location> {
        return await LocationLoader.load(batch.location, true);
    }

    @FieldResolver(() => Company)
    async company(@Root() batch: Batch): Promise<Company> {
        return await CompanyLoader.load(batch.company, true);
    }

    @FieldResolver(() => ProductionLine, { nullable: true })
    async production_line(@Root() batch: Batch): Promise<ProductionLine> {
        if (!batch.production_line) return null;
        else
            return await ProductionLineLoader.load(batch.production_line, true);
    }
}
