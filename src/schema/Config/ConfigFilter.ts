import { BaseFilter } from './../Base/BaseFilter';
import { Config, ConfigKey, ConfigModel } from './Config';
import { DocumentType } from '@typegoose/typegoose';
import { FilterQuery } from 'mongoose';
import { InputType, Field } from 'type-graphql';

@InputType()
export class ConfigFilter extends BaseFilter {
    @Field(() => ConfigKey, { nullable: true })
    key?: ConfigKey;

    @Field({ nullable: true })
    active?: boolean = true;

    public async serializeConfigFilter(): Promise<
        FilterQuery<DocumentType<Config>>
    > {
        const query = this.serializeBaseFilter() as FilterQuery<
            DocumentType<Config>
        >;
        if (this.key) query.key = this.key;
        if (this.active !== undefined) query.active = this.active;
        return query;
    }
}
