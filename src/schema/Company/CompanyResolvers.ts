import { LotModel } from './../Lot/Lot';
import { TeamModel } from './../Team/Team';
import { UserRole } from '@src/auth/UserRole';
import { loaderResult } from '@src/utils/loaderResult';
import { Contact, ContactLoader, ContactModel } from './../Contact/Contact';
import { createBaseResolver } from './../Base/BaseResolvers';
import { LocationModel } from './../Location/Location';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { CompanyFilter } from './CompanyFilter';
import { CompanyList } from './CompanyList';
import { Context } from '@src/auth/context';
import { CreateCompanyInput, UpdateCompanyInput } from './CompanyInput';
import { Company, CompanyModel, CompanyLoader } from './Company';
import {
    Arg,
    Mutation,
    Resolver,
    Ctx,
    Query,
    FieldResolver,
    Root,
    UseMiddleware,
} from 'type-graphql';
import { Paginate } from '../Paginate';
import { FilterQuery, ObjectId } from 'mongoose';
import { Location } from '../Location/Location';
import { AppFile } from '../AppFile/AppFile';
import { StorageBucket } from '@src/services/CloudStorage/CloudStorage';
import { Ref, mongoose } from '@typegoose/typegoose';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';

const BaseResolver = createBaseResolver();

@Resolver(() => Company)
export class CompanyResolvers extends BaseResolver {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetCompanies })
    )
    @Query(() => Company)
    async company(
        @Arg('id', () => ObjectIdScalar) id: ObjectId
    ): Promise<Company> {
        return await CompanyModel.findById(id).lean();
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetCompanies })
    )
    @Query(() => CompanyList)
    async companies(
        @Ctx() context: Context,
        @Arg('filter') filter: CompanyFilter
    ): Promise<CompanyList> {
        return await Paginate.paginate({
            model: CompanyModel,
            query: await filter.serializeCompanyFilter(context),
            sort: { name: 1 },
            skip: filter.skip,
            take: filter.take,
        });
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateCompany })
    )
    @Mutation(() => Company)
    async createCompany(
        @Arg('data') data: CreateCompanyInput,
        @Ctx() { base, storage }: Context
    ): Promise<Company> {
        const doc: Company = { ...base, name: data.name, contacts: [] };
        const res = await CompanyModel.create(doc);
        return res.toJSON();
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.UpdateCompany })
    )
    @Mutation(() => Company)
    async updateCompany(
        @Arg('id', () => ObjectIdScalar) id: ObjectId,
        @Arg('data') data: UpdateCompanyInput,
        @Ctx() context: Context
    ): Promise<Company> {
        const doc = await CompanyModel.findById(id);
        if (data.name !== undefined) doc.name = data.name;
        if (data.deleted !== undefined) doc.deleted = data.deleted;
        doc.modified_by = context.base.modified_by;
        doc.date_modified = context.base.date_modified;
        await doc.save();
        return doc.toJSON();
    }

    @FieldResolver(() => [Location])
    async locations(@Root() { _id }: Company): Promise<Location[]> {
        return await LocationModel.find({
            company: _id,
            deleted: false,
        }).lean();
    }

    @FieldResolver(() => [Contact])
    async contacts(@Root() { contacts }: Company): Promise<Contact[]> {
        const res = await ContactModel.find({
            deleted: false,
            _id: { $in: (contacts ? contacts : []).map((c) => c.toString()) },
        });
        return res.map((doc) => doc.toJSON());
    }

    @FieldResolver(() => [AppFile])
    async files(
        @Ctx() { storage }: Context,
        @Root() { _id }: Company
    ): Promise<AppFile[]> {
        const files = await storage.files(
            StorageBucket.Attachments,
            _id.toString()
        );

        return files.map((file) => AppFile.fromFile(file, _id.toString()));
    }
}
