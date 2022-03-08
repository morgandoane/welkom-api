import { UpdateDesignInput } from './UpdateDesignInput';
import { DesignFilter } from './DesignFilter';
import { DesignList } from './DesignList';
import { Paginate } from '../Pagination/Pagination';
import { Ref } from '@typegoose/typegoose';
import { Context } from '@src/auth/context';
import { createUploadEnabledResolver } from '../UploadEnabled/UploadEnabledResolvers';
import {
    Arg,
    Ctx,
    FieldResolver,
    Mutation,
    Query,
    Resolver,
    Root,
    UseMiddleware,
} from 'type-graphql';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { Design, DesignLoader, DesignModel } from './Design';
import { CreateDesignInput } from './CreateDesignInput';

const UploadEnabledResolver = createUploadEnabledResolver();

@Resolver(() => Design)
export class DesignResolvers extends UploadEnabledResolver {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetDesigns })
    )
    @Query(() => DesignList)
    async designs(
        @Arg('filter', () => DesignFilter) filter: DesignFilter
    ): Promise<DesignList> {
        return await Paginate.paginate({
            model: DesignModel,
            query: await filter.serializeDesignFilter(),
            skip: filter.skip,
            take: filter.take,
            sort: { date_created: -1 },
        });
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetDesigns })
    )
    @Query(() => Design)
    async design(
        @Arg('id', () => ObjectIdScalar) id: Ref<Design>
    ): Promise<Design> {
        return await DesignLoader.load(id, true);
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateDesign })
    )
    @Mutation(() => Design)
    async createDesign(
        @Ctx() context: Context,
        @Arg('data', () => CreateDesignInput) data: CreateDesignInput
    ): Promise<Design> {
        const design = await data.validateDesign(context);
        const res = await DesignModel.create(design);

        return res.toJSON() as unknown as Design;
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.UpdateDesign })
    )
    @Mutation(() => Design)
    async updateDesign(
        @Arg('id', () => ObjectIdScalar) id: Ref<Design>,
        @Arg('data', () => UpdateDesignInput) data: UpdateDesignInput
    ): Promise<Design> {
        const res = await DesignModel.findByIdAndUpdate(
            id,
            await data.serializeDesignUpdate(),
            { new: true }
        );

        DesignLoader.clear(id);

        return res.toJSON() as unknown as Design;
    }

    @FieldResolver(() => Design)
    async parent(@Root() { parent }: Design): Promise<Design> {
        if (!parent) return null;
        else return await DesignLoader.load(parent.toString(), true);
    }

    @FieldResolver(() => [Design])
    async ancestry(@Root() { parent }: Design): Promise<Design[]> {
        if (!parent) return [];
        const loop = async (
            parent: Ref<Design> | undefined | null,
            stack: Design[]
        ): Promise<Design[]> => {
            if (
                !parent ||
                stack.map((s) =>
                    s._id.toString().includes(parent._id.toString())
                )
            )
                return stack;
            else {
                const parentDoc = await DesignLoader.load(
                    parent.toString(),
                    true
                );

                stack.push(parentDoc);

                return await loop(parentDoc.parent, stack);
            }
        };

        return await loop(parent, []);
    }
}
