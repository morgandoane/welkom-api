import { Company } from '@src/schema/Company/Company';
import { TeamModel } from '@src/schema/Team/Team';
import { Ref, mongoose } from '@typegoose/typegoose';
import { ObjectId } from 'mongoose';

export const getCompaniesForProfile = async (
    id: string | ObjectId
): Promise<Ref<Company>[]> => {
    const teams = await TeamModel.find({
        members: id.toString(),
        deleted: false,
    });

    const companyIds = teams.map(
        (t) => new mongoose.Types.ObjectId(t.company.toString())
    );

    return companyIds;
};
