import { CompanyLoader } from './../Company/Company';
import { Company } from '@src/schema/Company/Company';
import { LocationLoader } from './../Location/Location';
import { CreateProductionLineInput } from './ProductionLineInput';
import { Permitted } from '@src/auth/middleware/Permitted';
import { createBaseResolver } from './../Base/BaseResolvers';
import { ProductionLine, ProductionLineModel } from './ProductionLine';
import {
    Query,
    Resolver,
    UseMiddleware,
    Mutation,
    Ctx,
    Arg,
    FieldResolver,
    Root,
} from 'type-graphql';
import { UserRole } from '@src/auth/UserRole';
import { Context } from '@src/auth/context';
import { Location } from '../Location/Location';
import { loaderResult } from '@src/utils/loaderResult';

const BaseResolver = createBaseResolver();

@Resolver(() => ProductionLine)
export class ProductionLineResolvers extends BaseResolver {
    @UseMiddleware(Permitted())
    @Query(() => [ProductionLine])
    async productionLines(): Promise<ProductionLine[]> {
        const res = await ProductionLineModel.find({ deleted: false });
        return res.map((doc) => doc.toJSON());
    }

    @UseMiddleware(Permitted({ type: 'role', role: UserRole.Manager }))
    @Mutation(() => ProductionLine)
    async createProductionLine(
        @Ctx() context: Context,
        @Arg('data', () => CreateProductionLineInput)
        data: CreateProductionLineInput
    ): Promise<ProductionLine> {
        const doc = await data.validate(context);
        const res = await ProductionLineModel.create(doc);
        return res.toJSON();
    }

    @FieldResolver(() => Location)
    async location(@Root() { location }: ProductionLine): Promise<Location> {
        return loaderResult(await LocationLoader.load(location.toString()));
    }

    @FieldResolver(() => Company)
    async company(@Root() { company }: ProductionLine): Promise<Company> {
        return loaderResult(await CompanyLoader.load(company.toString()));
    }
}
