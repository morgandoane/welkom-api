import { LocationLoader, Location } from './../Location/Location';
import { UpdateProductionLineInput } from './UpdateProductionLineInput';
import { ProductionLineFilter } from './ProductionLineFilter';
import { ProductionLineList } from './ProductionLineList';
import { Paginate } from '../Pagination/Pagination';
import { Ref } from '@typegoose/typegoose';
import { Context } from '@src/auth/context';
import { createUploadEnabledResolver } from '../UploadEnabled/UploadEnabledResolvers';
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
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import {
    ProductionLine,
    ProductionLineLoader,
    ProductionLineModel,
} from './ProductionLine';
import { CreateProductionLineInput } from './CreateProductionLineInput';

const UploadEnabledResolver = createUploadEnabledResolver();

@Resolver(() => ProductionLine)
export class ProductionLineResolvers extends UploadEnabledResolver {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetCompanies })
    )
    @Query(() => ProductionLineList)
    async companies(
        @Arg('filter') filter: ProductionLineFilter
    ): Promise<ProductionLineList> {
        return await Paginate.paginate({
            model: ProductionLineModel,
            query: await filter.serializeProductionLineFilter(),
            skip: filter.skip,
            take: filter.take,
            sort: { date_created: -1 },
        });
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetCompanies })
    )
    @Query(() => ProductionLine)
    async ProductionLine(
        @Arg('id', () => ObjectIdScalar) id: Ref<ProductionLine>
    ): Promise<ProductionLine> {
        return await ProductionLineLoader.load(id, true);
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.CreateProductionLine,
        })
    )
    @Mutation(() => ProductionLine)
    async createProductionLine(
        @Ctx() context: Context,
        @Arg('data', () => CreateProductionLineInput)
        data: CreateProductionLineInput
    ): Promise<ProductionLine> {
        const ProductionLine = await data.validateProductionLine(context);
        const res = await ProductionLineModel.create(ProductionLine);
        return res;
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.UpdateProductionLine,
        })
    )
    @Mutation(() => ProductionLine)
    async updateProductionLine(
        @Arg('id', () => ObjectIdScalar) id: Ref<ProductionLine>,
        @Arg('data', () => UpdateProductionLineInput)
        data: UpdateProductionLineInput
    ): Promise<ProductionLine> {
        const res = await ProductionLineModel.findByIdAndUpdate(
            id,
            await data.serializeProductionLineUpdate(),
            { new: true }
        );

        ProductionLineLoader.clear(id);

        return res;
    }

    @FieldResolver(() => Location)
    async location(@Root() { location }: ProductionLine): Promise<Location> {
        return await LocationLoader.load(location, true);
    }
}
