import { Permission } from '@src/auth/permissions';
import { Context } from '@src/auth/context';
import { Team } from './Team';
import { FilterQuery } from 'mongoose';
import { BaseFilter } from './../Base/BaseFilter';
import { Field, InputType } from 'type-graphql';

@InputType()
export class TeamFilter extends BaseFilter {
    @Field({ nullable: true })
    name?: string;

    public serializeTeamFilter(): FilterQuery<Team> {
        const query: FilterQuery<Team> = { ...this.serializeBaseFilter() };

        if (this.name) query.name = { $regex: new RegExp(this.name, 'i') };

        return query;
    }
}
