import { UserInputError } from 'apollo-server-errors';
import { CompanyLoader, CompanyModel } from './../Company/Company';
import { Context } from './../../auth/context';
import { ContactInput } from './ContactInputs';
import { Paginate } from './../Paginate';
import { ContactFilter } from './ContactFilter';
import { ContactList } from './ContactList';
import { ObjectId } from 'mongoose';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { loaderResult } from './../../utils/loaderResult';
import { createBaseResolver } from './../Base/BaseResolvers';
import { Contact, ContactLoader, ContactModel } from './Contact';
import {
    Arg,
    Query,
    Resolver,
    Mutation,
    Ctx,
    UseMiddleware,
} from 'type-graphql';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';

const BaseResolvers = createBaseResolver();

@Resolver(() => Contact)
export class ContactResolvers extends BaseResolvers {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetContacts })
    )
    @Query(() => Contact)
    async contact(
        @Arg('id', () => ObjectIdScalar) id: ObjectId
    ): Promise<Contact> {
        return await loaderResult(
            await ContactLoader.load(id.toString())
        ).toJSON();
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetContacts })
    )
    @Query(() => ContactList)
    async contacts(
        @Arg('filter', () => ContactFilter) filter: ContactFilter
    ): Promise<ContactList> {
        return await Paginate.paginate({
            model: ContactModel,
            sort: { given_name: -1 },
            skip: filter.skip,
            take: filter.take,
            query: await filter.serializeContactFilter(),
        });
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateContact })
    )
    @Mutation(() => Contact)
    async createContact(
        @Ctx() context: Context,
        @Arg('company', () => ObjectIdScalar) company_id: ObjectId,
        @Arg('data', () => ContactInput) data: ContactInput
    ): Promise<Contact> {
        const company = await CompanyModel.findById(company_id).catch((e) => {
            throw new UserInputError(
                'Failed to find company with id ' + company_id
            );
        });
        const res = await ContactModel.create(
            data.serializeContactInput(context)
        ).catch((e) => {
            throw e;
        });

        company.contacts.push(res._id);
        await company.save();

        return res.toJSON();
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.UpdateContact })
    )
    @Mutation(() => Contact)
    async updateContact(
        @Ctx() context: Context,
        @Arg('id', () => ObjectIdScalar) id: ObjectId,
        @Arg('data', () => ContactInput) data: ContactInput
    ): Promise<Contact> {
        const doc = await ContactModel.findById(id).catch((e) => {
            throw new UserInputError(
                'Failed to find contact with id ' + id.toString()
            );
        });
        doc.family_name = data.family_name;
        doc.given_name = data.given_name;
        doc.date_modified = context.base.date_modified;
        doc.modified_by = context.base.modified_by;

        if (data.email !== undefined) doc.email = data.email || null;
        if (data.phone !== undefined) doc.phone = data.phone || null;
        if (data.cc_on_order !== undefined)
            doc.cc_on_order = data.cc_on_order || null;
        if (data.email_on_order !== undefined)
            doc.email_on_order = data.email_on_order || null;

        await doc.save();

        ContactLoader.clearAll();

        return doc.toJSON();
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.UpdateContact })
    )
    @Mutation(() => Contact)
    async deleteContact(
        @Ctx() { base }: Context,
        @Arg('id', () => ObjectIdScalar) id: ObjectId
    ): Promise<Contact> {
        const doc = await ContactModel.findById(id);
        doc.deleted = true;
        doc.date_modified = base.date_modified;
        doc.modified_by = base.modified_by;
        await doc.save();

        ContactLoader.clearAll();
        return doc;
    }
}
