import { ConfigFilter } from './ConfigFilter';
import { mongoose } from '@typegoose/typegoose';
import { Context } from '@src/auth/context';
import { ConfigInput } from './ConfigInputs';
import { Paginate } from './../Paginate';
import { ConfigList } from './ConfigList';
import { Config, ConfigModel, ConfigKey } from './Config';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { PaginateArg } from '../Pagination/Pagination';
import { createBaseResolver } from '../Base/BaseResolvers';
import { Mongo } from '../Mongo';

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
                const match = await Mongo.Config.findOne({
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
        @Arg('data') { key, fields }: ConfigInput
    ): Promise<Config> {
        const doc: Config = {
            date_created: new Date(),
            created_by: new mongoose.Types.ObjectId('61abfc98ceaa890011f83d6d'),
            _id: new mongoose.Types.ObjectId(),
            deleted: false,
            key,
            fields: fields.map((field) => field.validate()),
        };
        return await Mongo.Config.create(doc);
    }
}
