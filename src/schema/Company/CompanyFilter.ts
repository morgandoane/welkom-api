import { Context } from './../../auth/context';
import { BaseFilter } from './../Base/BaseFilter';
import { Field, InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { Company } from './Company';
import { TeamModel } from '../Team/Team';
import { UserRole } from '@src/auth/UserRole';
import { mongoose } from '@typegoose/typegoose';

@InputType()
export class CompanyFilter extends BaseFilter {
    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    mine?: boolean;

    public async serializeCompanyFilter(
        context: Context
    ): Promise<FilterQuery<Company>> {
        const res: FilterQuery<Company> = { ...this.serializeBaseFilter() };
        if (this.name) res.name = { $regex: new RegExp(this.name, 'i') };

        if (this.mine !== undefined && this.mine !== null) {
            // determine companies based on assigned teams or on all teams in db
            const teams = await TeamModel.find(
                context.roles == [UserRole.User]
                    ? {
                          members: context.base.created_by,
                          deleted: false,
                      }
                    : { deleted: false }
            );

            const companyIds = teams.map(
                (t) => new mongoose.Types.ObjectId(t.company.toString())
            );

            if (this.mine)
                res.$and = [
                    ...(res.$and ? res.$and : []),
                    { _id: { $in: companyIds } },
                ];
            else
                res.$and = [
                    ...(res.$and ? res.$and : []),
                    { _id: { $nin: companyIds } },
                ];
        }
        return res;
    }
}
