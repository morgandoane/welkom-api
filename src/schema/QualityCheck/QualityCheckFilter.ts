import { ItemModel } from './../Item/Item';
import { UploadEnabledFilter } from '../UploadEnabled/UploadEnabledFilter';
import { Field, InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';
import { QualityCheck, QualityCheckCategory } from './QualityCheck';

@InputType()
export class QualityCheckFilter extends UploadEnabledFilter {
    @Field({ nullable: true })
    item?: string | null;

    @Field({ nullable: true })
    item_name?: string | null;

    @Field({ nullable: true })
    prompt?: string | null;

    @Field(() => QualityCheckCategory, { nullable: true })
    category?: QualityCheckCategory;

    public async serializeQualityCheckFilter(): Promise<
        FilterQuery<DocumentType<QualityCheck>>
    > {
        const query = {
            ...(await this.serializeUploadEnabledFilter()),
        } as FilterQuery<DocumentType<QualityCheck>>;

        if (this.item !== undefined) query.item = this.item;
        if (this.category) query.category = this.category;
        if (this.item_name && !this.item) {
            const matches = await ItemModel.find({
                $or: [
                    {
                        ['names.english']: {
                            $regex: new RegExp(this.item_name, 'i'),
                        },
                    },
                    {
                        ['names.spanish']: {
                            $regex: new RegExp(this.item_name, 'i'),
                        },
                    },
                ],
            });

            query.item = { $in: matches.map((m) => m._id) };
        }
        if (this.prompt)
            query.$or = [
                {
                    ['prompt.english']: {
                        $regex: new RegExp(this.prompt, 'i'),
                    },
                },
                {
                    ['prompt.spanish']: {
                        $regex: new RegExp(this.prompt, 'i'),
                    },
                },
            ];

        return query;
    }
}
