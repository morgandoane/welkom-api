import { UserInputError } from 'apollo-server-errors';
import { Context } from '@src/auth/context';
import { Permission } from '@src/auth/permissions';
import { LocationLoader } from './../Location/Location';
import { CompanyLoader } from './../Company/Company';
import { mongoose } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { Team } from './Team';
import { loaderResult } from '@src/utils/loaderResult';

@InputType()
export class CreateTeamInput {
    @Field()
    name!: string;

    @Field({ nullable: true })
    description?: string;

    @Field()
    company!: string;

    @Field(() => [String])
    members!: string[];

    @Field({ nullable: true })
    location?: string;

    @Field(() => [Permission])
    permissions!: Permission[];

    public async serialize({ base, permissions }: Context): Promise<Team> {
        const company = loaderResult(await CompanyLoader.load(this.company));

        if (this.location) {
            const location = loaderResult(
                await LocationLoader.load(this.location)
            );

            if (location.company.toString() !== company._id.toString())
                throw new UserInputError('Location does not match company');
        }

        const doc: Team = {
            ...base,
            name: this.name,
            description: this.description,
            company: company._id,
            location: this.location
                ? new mongoose.Types.ObjectId(this.location)
                : undefined,
            permissions: this.permissions,
            members: this.members,
        };

        return doc;
    }
}

@InputType()
export class UpdateTeamInput {
    @Field({ nullable: true })
    deleted?: boolean;

    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    description?: string;

    @Field({ nullable: true })
    company?: string;

    @Field(() => [String], { nullable: true })
    members?: string[];

    @Field({ nullable: true })
    location?: string;

    @Field(() => [Permission], { nullable: true })
    permissions?: Permission[];

    public async serializeTeamUpdate({
        base,
    }: Context): Promise<Partial<Team>> {
        const update: Partial<Team> = {};
        if (this.deleted !== undefined && this.deleted !== null) {
            update.deleted = this.deleted;
        }

        if (this.name) {
            update.name = this.name;
        }

        if (this.description) {
            update.description = this.description;
        }

        if (this.company) {
            const company = loaderResult(
                await CompanyLoader.load(this.company)
            );

            update.company = company._id;
        }

        if (this.members) {
            update.members = this.members;
        }

        if (this.location) {
            const company = loaderResult(
                await CompanyLoader.load(this.company || '')
            );

            const location = loaderResult(
                await LocationLoader.load(this.location)
            );

            if (location.company.toString() !== company._id.toString())
                throw new UserInputError('Location does not match company');

            update.location = location._id;
        }

        if (this.permissions) {
            update.permissions = this.permissions;
        }

        update.date_modified = base.date_modified;
        update.modified_by = base.modified_by;

        return update;
    }
}
