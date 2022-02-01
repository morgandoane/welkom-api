import { UpdateCompanyInput } from './UpdateCompanyInput';
import { CompanyFilter } from './CompanyFilter';
import { CompanyList } from './CompanyList';
import { Paginate } from './../Pagination/Pagination';
import { Ref } from '@typegoose/typegoose';
import { Context } from '@src/auth/context';
import { createUploadEnabledResolver } from './../UploadEnabled/UploadEnabledResolvers';
import {
    Arg,
    Ctx,
    Mutation,
    Query,
    Resolver,
    UseMiddleware,
} from 'type-graphql';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { Company, CompanyLoader, CompanyModel } from './Company';
import { CreateCompanyInput } from './CreateCompanyInput';

const UploadEnabledResolver = createUploadEnabledResolver();

@Resolver(() => Company)
export class CompanyResolvers extends UploadEnabledResolver {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetCompanies })
    )
    @Query(() => CompanyList)
    async companies(
        @Arg('filter') filter: CompanyFilter
    ): Promise<CompanyList> {
        return await Paginate.paginate({
            model: CompanyModel,
            query: await filter.serializeCompanyFilter(),
            skip: filter.skip,
            take: filter.take,
            sort: { date_created: -1 },
        });
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetCompanies })
    )
    @Query(() => Company)
    async company(
        @Arg('id', () => ObjectIdScalar) id: Ref<Company>
    ): Promise<Company> {
        return await CompanyLoader.load(id, true);
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateCompany })
    )
    @Mutation(() => Company)
    async createCompany(
        @Ctx() context: Context,
        @Arg('data', () => CreateCompanyInput) data: CreateCompanyInput
    ): Promise<Company> {
        const company = await data.validateCompany(context);
        const res = await CompanyModel.create(company);
        return res;
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.UpdateCompany })
    )
    @Mutation(() => Company)
    async updateCompany(
        @Arg('id', () => ObjectIdScalar) id: Ref<Company>,
        @Arg('data', () => UpdateCompanyInput) data: UpdateCompanyInput
    ): Promise<Company> {
        const res = await CompanyModel.findByIdAndUpdate(
            id,
            await data.serializeCompanyUpdate(),
            { new: true }
        );

        CompanyLoader.clear(id);

        return res;
    }
}
