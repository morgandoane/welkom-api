import { BaseFilter } from './../Base/BaseFilter';
import { Field, InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';
import { Folder, FolderClass } from './Folder';

@InputType()
export class FolderFilter extends BaseFilter {
    @Field(() => FolderClass)
    folder_class!: FolderClass;

    public async serializeFolderFilter(): Promise<
        FilterQuery<DocumentType<Folder>>
    > {
        const query = {
            ...(await this.serializeBaseFilter()),
        } as FilterQuery<DocumentType<Folder>>;

        if (this.folder_class) query.folder_class = this.folder_class;

        return query;
    }
}
