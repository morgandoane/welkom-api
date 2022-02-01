import { UploadEnabledFilter } from '../UploadEnabled/UploadEnabledFilter';
import { InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';
import { Team } from './Team';

@InputType()
export class TeamFilter extends UploadEnabledFilter {
    public async serializeTeamFilter(): Promise<
        FilterQuery<DocumentType<Team>>
    > {
        const query = {
            ...(await this.serializeUploadEnabledFilter()),
        } as FilterQuery<DocumentType<Team>>;

        return query;
    }
}
