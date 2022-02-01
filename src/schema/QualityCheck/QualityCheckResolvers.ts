import { UpdateQualityCheckInput } from './UpdateQualityCheckInput';
import { QualityCheckFilter } from './QualityCheckFilter';
import { QualityCheckList } from './QualityCheckList';
import { Paginate } from '../Pagination/Pagination';
import { Ref } from '@typegoose/typegoose';
import { Context } from '@src/auth/context';
import { createUploadEnabledResolver } from '../UploadEnabled/UploadEnabledResolvers';
import {
    Arg,
    Ctx,
    Mutation,
    Query,
    Resolver,
    UseMiddleware,
} from 'type-graphql';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import {
    QualityCheck,
    QualityCheckLoader,
    QualityCheckModel,
} from './QualityCheck';
import { CreateQualityCheckInput } from './CreateQualityCheckInput';

const UploadEnabledResolver = createUploadEnabledResolver();

@Resolver(() => QualityCheck)
export class QualityCheckResolvers extends UploadEnabledResolver {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetCompanies })
    )
    @Query(() => QualityCheckList)
    async qualityChecks(
        @Arg('filter') filter: QualityCheckFilter
    ): Promise<QualityCheckList> {
        return await Paginate.paginate({
            model: QualityCheckModel,
            query: await filter.serializeQualityCheckFilter(),
            skip: filter.skip,
            take: filter.take,
            sort: { date_created: -1 },
        });
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetCompanies })
    )
    @Query(() => QualityCheck)
    async qualityCheck(
        @Arg('id', () => ObjectIdScalar) id: Ref<QualityCheck>
    ): Promise<QualityCheck> {
        return await QualityCheckLoader.load(id, true);
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.CreateQualityCheck,
        })
    )
    @Mutation(() => QualityCheck)
    async createQualityCheck(
        @Ctx() context: Context,
        @Arg('data', () => CreateQualityCheckInput)
        data: CreateQualityCheckInput
    ): Promise<QualityCheck> {
        const qualityCheck = await data.validateQualityCheck(context);
        const res = await QualityCheckModel.create(qualityCheck);
        return res;
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.UpdateQualityCheck,
        })
    )
    @Mutation(() => QualityCheck)
    async updateQualityCheck(
        @Arg('id', () => ObjectIdScalar) id: Ref<QualityCheck>,
        @Arg('data', () => UpdateQualityCheckInput)
        data: UpdateQualityCheckInput
    ): Promise<QualityCheck> {
        const res = await QualityCheckModel.findByIdAndUpdate(
            id,
            await data.serializeQualityCheckUpdate(),
            { new: true }
        );

        QualityCheckLoader.clear(id);

        return res;
    }
}
