import { ObjectIdScalar } from './../ObjectIdScalar';
import { CompanyFilter } from './CompanyFilter';
import { CompanyList } from './CompanyList';
import { _FieldValueUnion } from './../Field/Field';
import { Context } from '@src/auth/context';
import { CreateCompanyInput, UpdateCompanyInput } from './CompanyInput';
import { createConfiguredResolver } from '../Configured/ConfiguredResolver';
import { Company, CompanyModel } from './Company';
import { Arg, Mutation, Resolver, Ctx, Query } from 'type-graphql';
import { Paginate } from '../Paginate';
import { FilterQuery } from 'mongoose';

const ConfiguredResolver = createConfiguredResolver();

@Resolver(() => Company)
export class CompanyResolvers extends ConfiguredResolver {
    @Query(() => Company)
    async company(
        @Arg('id', () => ObjectIdScalar) id: string
    ): Promise<Company> {
        return await CompanyModel.findById(id).lean();
    }

    @Query(() => CompanyList)
    async companies(
        @Arg('filter') filter: CompanyFilter
    ): Promise<CompanyList> {
        const { skip, take, name } = filter;
        const query: FilterQuery<Company> = { ...filter.serialize() };
        if (name !== undefined) query.name = { $regex: new RegExp(name, 'i') };

        return await Paginate.paginate({
            model: CompanyModel,
            query,
            sort: { date_created: -1 },
            skip,
            take,
        });
    }

    @Mutation(() => Company)
    async createCompany(
        @Arg('data') data: CreateCompanyInput,
        @Ctx() context: Context
    ): Promise<Company> {
        const configured = await data.validate(context);
        const doc: Company = { ...configured, name: data.name };
        return await (await CompanyModel.create(doc)).toJSON();
    }

    @Mutation(() => Company)
    async updateCompany(
        @Arg('id') id: string,
        @Arg('data') data: UpdateCompanyInput,
        @Ctx() context: Context
    ): Promise<Company> {
        const configured = await data.validate(context);
        const doc = await CompanyModel.findById(id);
        if (data.name !== undefined) doc.name = data.name;
        if (data.deleted !== undefined) doc.deleted = data.deleted;
        doc.field_values = configured.field_values;
        doc.config = configured.config;
        doc.modified_by = context.base.modified_by;
        doc.date_modified = context.base.date_modified;
        await doc.save();
        return doc;
    }
}
