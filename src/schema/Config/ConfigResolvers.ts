import { ConfigFilter } from './ConfigFilter';
import { mongoose } from '@typegoose/typegoose';
import { Context } from '@src/auth/context';
import { ConfigInput } from './ConfigInputs';
import { Paginate } from './../Paginate';
import { ConfigList } from './ConfigList';
import { Config, ConfigModel, ConfigKey } from './Config';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { createBaseResolver } from '../Base/BaseResolvers';

const BaseResolver = createBaseResolver();

@Resolver(() => Config)
export class ConfigResolvers extends BaseResolver {
    @Query(() => ConfigList)
    async configs(
        @Arg('filter') { skip, take, key, only_active }: ConfigFilter
    ): Promise<ConfigList> {
        if (only_active) {
            const res: Config[] = [];

            for (const key of Object.keys(ConfigKey)) {
                const match = await ConfigModel.findOne({
                    key: key ? (key as ConfigKey) : undefined,
                }).sort({ date_created: -1 });

                if (match) res.push(match);
            }
        }
        return await Paginate.paginate({
            model: ConfigModel,
            query: {
                key: key ? (key as ConfigKey) : undefined,
            },
            sort: { date_created: -1 },
            skip,
            take,
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
