import { Company, CompanyLoader } from './../../../Company/Company';
import { Context } from '../../../../auth/context';
import { Product, ProductLoader, ProductModel } from './Product';
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
import { createItemResolver } from '../../ItemResolver';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';
import { ObjectIdScalar } from '@src/schema/ObjectIdScalar/ObjectIdScalar';
import { Paginate } from '@src/schema/Pagination/Pagination';
import { Ref } from '@typegoose/typegoose';
import { ProductList } from './ProductList';
import { ProductFilter } from './ProductFilter';
import { CreateProductInput } from './CreateProductInput';
import { UpdateProductInput } from './UpdateProductInput';

const ItemResolver = createItemResolver();

@Resolver(() => Product)
export class ProductResolvers extends ItemResolver {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetItems })
    )
    @Query(() => ProductList)
    async products(@Arg('filter') filter: ProductFilter): Promise<ProductList> {
        return await Paginate.paginate({
            model: ProductModel,
            query: await filter.serializeProductFilter(),
            skip: filter.skip,
            take: filter.take,
            sort: { date_created: -1 },
        });
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetItems })
    )
    @Query(() => Product)
    async product(
        @Arg('id', () => ObjectIdScalar) id: Ref<Product>
    ): Promise<Product> {
        return await ProductLoader.load(id, true);
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateItem })
    )
    @Mutation(() => Product)
    async createProduct(
        @Ctx() context: Context,
        @Arg('data', () => CreateProductInput) data: CreateProductInput
    ): Promise<Product> {
        const doc = await data.validateProduct(context);
        const res = await ProductModel.create(doc);
        return res.toJSON() as unknown as Product;
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.UpdateItem })
    )
    @Mutation(() => Product)
    async updateProduct(
        @Arg('id', () => ObjectIdScalar) id: Ref<Product>,
        @Arg('data', () => UpdateProductInput) data: UpdateProductInput
    ): Promise<Product> {
        const res = await ProductModel.findByIdAndUpdate(
            id,
            await data.serializeProductUpdate(),
            { new: true }
        );

        ProductLoader.clear(id);

        return res.toJSON() as unknown as Product;
    }

    @FieldResolver(() => Company)
    async company(@Root() { company }: Product): Promise<Company> {
        return await CompanyLoader.load(company, true);
    }
}
