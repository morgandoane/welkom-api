import { ObjectIdScalar } from '@src/schema/ObjectIdScalar/ObjectIdScalar';
import { UploadEnabledFilter } from '../UploadEnabled/UploadEnabledFilter';
import { Field, InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { DocumentType, Ref } from '@typegoose/typegoose';
import { Design, DesignLocation, DesignCategory } from './Design';

@InputType()
export class DesignFilter extends UploadEnabledFilter {
    @Field({ nullable: true })
    part_number?: string;

    @Field(() => DesignLocation, { nullable: true })
    location?: DesignLocation;

    @Field(() => DesignCategory, { nullable: true })
    category?: DesignCategory;

    @Field(() => ObjectIdScalar, { nullable: true })
    parent?: Ref<Design>;

    @Field({ nullable: true })
    description?: string;

    public async serializeDesignFilter(): Promise<
        FilterQuery<DocumentType<Design>>
    > {
        const query = {
            ...(await this.serializeUploadEnabledFilter()),
        } as FilterQuery<DocumentType<Design>>;

        if (this.part_number)
            query.name = { $regex: new RegExp(this.part_number, 'i') };

        if (this.location) query.location = this.location;
        if (this.category) query.category = this.category;
        if (this.parent) query.parent = this.parent;

        if (this.description)
            query.name = { $regex: new RegExp(this.description, 'i') };

        return query;
    }
}
