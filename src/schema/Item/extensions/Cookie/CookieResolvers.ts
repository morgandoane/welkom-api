import { Context } from './../../../../auth/context';
import { Cookie, CookieLoader, CookieModel } from './Cookie';
import {
    Arg,
    Ctx,
    Mutation,
    Query,
    Resolver,
    UseMiddleware,
} from 'type-graphql';
import { createItemResolver } from './../../ItemResolver';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';
import { ObjectIdScalar } from '@src/schema/ObjectIdScalar/ObjectIdScalar';
import { Paginate } from '@src/schema/Pagination/Pagination';
import { Ref } from '@typegoose/typegoose';
import { CookieList } from './CookieList';
import { CookieFilter } from './CookieFilter';
import { CreateCookieInput } from './CreateCookieInput';
import { UpdateCookieInput } from './UpdateCookieInput';

const ItemResolver = createItemResolver();

@Resolver(() => Cookie)
export class CookieResolvers extends ItemResolver {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetItems })
    )
    @Query(() => CookieList)
    async cookies(@Arg('filter') filter: CookieFilter): Promise<CookieList> {
        return await Paginate.paginate({
            model: CookieModel,
            query: await filter.serializeCookieFilter(),
            skip: filter.skip,
            take: filter.take,
            sort: { date_created: -1 },
        });
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetItems })
    )
    @Query(() => Cookie)
    async cookie(
        @Arg('id', () => ObjectIdScalar) id: Ref<Cookie>
    ): Promise<Cookie> {
        return await CookieLoader.load(id, true);
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateItem })
    )
    @Mutation(() => Cookie)
    async createCookie(
        @Ctx() context: Context,
        @Arg('data', () => CreateCookieInput) data: CreateCookieInput
    ): Promise<Cookie> {
        const doc = await data.validateCookie(context);
        const res = await CookieModel.create(doc);
        return res;
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.UpdateItem })
    )
    @Mutation(() => Cookie)
    async updateCookie(
        @Arg('id', () => ObjectIdScalar) id: Ref<Cookie>,
        @Arg('data', () => UpdateCookieInput) data: UpdateCookieInput
    ): Promise<Cookie> {
        const res = await CookieModel.findByIdAndUpdate(
            id,
            await data.serializeCookieUpdate(),
            { new: true }
        );

        CookieLoader.clear(id);

        return res;
    }
}
