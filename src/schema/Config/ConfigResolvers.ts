import { ConfigFilter } from './ConfigFilter';
import { Context } from '@src/auth/context';
import { ConfigInput } from './ConfigInputs';
import { Paginate } from './../Paginate';
import { ConfigList } from './ConfigList';
import { Config, ConfigModel } from './Config';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { createBaseResolver } from '../Base/BaseResolvers';

const BaseResolver = createBaseResolver();

@Resolver(() => Config)
export class ConfigResolvers extends BaseResolver {
    @Query(() => ConfigList)
    async configs(@Arg('filter') filter: ConfigFilter): Promise<ConfigList> {
        return await Paginate.paginate({
            model: ConfigModel,
            query: await filter.serializeConfigFilter(),
            sort: { date_created: -1 },
            skip: filter.skip,
            take: filter.take,
        });
    }

    @Mutation(() => Config)
    async createConfig(
        @Ctx() { base }: Context,
        @Arg('data') { key, fields }: ConfigInput
    ): Promise<Config> {
        const doc: Config = {
            ...base,
            key,
            fields: fields.map((field) => field.validate()),
        };
        const res = await ConfigModel.create(doc);
        return res;
    }
}
