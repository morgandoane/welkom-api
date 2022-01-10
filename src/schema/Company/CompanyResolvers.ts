import { LegacyItemOrderModel } from './../../legacy/itemOrder';
import { TeamModel } from './../Team/Team';
import { UserRole } from '@src/auth/UserRole';
import { loaderResult } from '@src/utils/loaderResult';
import { Contact, ContactLoader } from './../Contact/Contact';
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
        const { skip, take, name, mine } = filter;
        const query: FilterQuery<Company> = { ...filter.serializeBaseFilter() };
        if (name !== undefined) query.name = { $regex: new RegExp(name, 'i') };

        if (mine !== undefined) {
            // determine companies based on assigned teams or on all teams in db
            const teams = await TeamModel.find(
                context.roles == [UserRole.User]
                    ? {
                          members: context.base.created_by,
                          deleted: false,
                      }
                    : { deleted: false }
            );

            const companyIds = teams.map(
                (t) => new mongoose.Types.ObjectId(t.company.toString())
            );

            if (mine == true)
                query.$and = [...query.$and, { _id: { $in: companyIds } }];
            else query.$and = [...query.$and, { _id: { $nin: companyIds } }];
        }

        return await Paginate.paginate({
            model: CompanyModel,
            query,
            sort: { name: 1 },
            skip,
            take,
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
        return await (
            await ContactLoader.loadMany(contacts.map((c) => c.toString()))
        ).map((c) => loaderResult(c));
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
