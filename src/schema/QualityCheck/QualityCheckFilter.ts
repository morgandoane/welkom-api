import { DocumentType } from '@typegoose/typegoose';
import { BaseFilter } from './../Base/BaseFilter';
import { FilterQuery } from 'mongoose';
import { Field, InputType } from 'type-graphql';
import { QualityCheck } from './QualityCheck';
import { loaderResult } from '@src/utils/loaderResult';
import { ItemLoader } from '../Item/Item';

@InputType()
export class QualityCheckFilter extends BaseFilter {
    @Field({ nullable: true })
    item?: string;

    @Field({ nullable: true })
    phrase?: string;

    public async serializeCheckFilter(): Promise<
        FilterQuery<DocumentType<QualityCheck>>
    > {
        const filter: FilterQuery<DocumentType<QualityCheck>> = {
            ...this.serializeBaseFilter(),
        } as FilterQuery<DocumentType<QualityCheck>>;

        if (this.item) {
            const item = loaderResult(await ItemLoader.load(this.item));
            filter.item = item._id;
        }
        if (this.phrase) filter['prompt.phrase'] = this.phrase;

        return filter;
    }
}
