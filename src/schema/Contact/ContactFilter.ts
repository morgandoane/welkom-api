import { CompanyLoader } from './../Company/Company';
import { FilterQuery } from 'mongoose';
import { BaseFilter } from './../Base/BaseFilter';
import { Field, InputType } from 'type-graphql';
import { Contact, ContactLoader } from './Contact';
import { loaderResult } from '@src/utils/loaderResult';

@InputType()
export class ContactFilter extends BaseFilter {
    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    company?: string;

    public async serializeContactFilter(): Promise<FilterQuery<Contact>> {
        const filter: FilterQuery<Contact> = { ...this.serializeBaseFilter() };
        if (this.name)
            filter.$and = [
                ...filter.$and,
                {
                    $or: [
                        { given_name: { $regex: new RegExp(this.name, 'i') } },
                        { family_name: { $regex: new RegExp(this.name, 'i') } },
                    ],
                },
            ];

        if (this.company) {
            const company = loaderResult(
                await CompanyLoader.load(this.company)
            );
            const res = (
                await ContactLoader.loadMany(
                    company.contacts.map((c) => c.toString())
                )
            ).map((result) => loaderResult(result));
            filter.$and = [
                ...filter.$and,
                {
                    _id: {
                        $in: res.map((doc) => doc._id),
                    },
                },
            ];
        }
        return filter;
    }
}
