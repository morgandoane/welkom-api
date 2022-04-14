import { Context } from '@src/auth/context';
import { CreateMachineInput, UpdateMachineInput } from './MachineInputs';
import { MachineList } from './MachineList';
import { Paginate } from '@src/schema/Paginate';
import { MachineFilter } from './MachineFilter';
import { loaderResult } from '@src/utils/loaderResult';
import { Ref } from '@typegoose/typegoose';
import { Permitted } from '@src/auth/middleware/Permitted';
import { createBaseResolver } from './../Base/BaseResolvers';
import {
    Arg,
    Query,
    Resolver,
    UseMiddleware,
    Mutation,
    Ctx,
    FieldResolver,
    Root,
} from 'type-graphql';
import { Machine, MachineLoader, MachineModel } from './Machine';
import { Permission } from '@src/auth/permissions';
import { ObjectIdScalar } from '../ObjectIdScalar';
import { StorageBucket } from '@src/services/CloudStorage/CloudStorage';
import { AppFile } from '../AppFile/AppFile';

const BaseResolvers = createBaseResolver();

@Resolver(() => Machine)
export class MachineResolvers extends BaseResolvers {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetMachines })
    )
    @Query(() => Machine)
    async machine(
        @Arg('id', () => ObjectIdScalar) id: Ref<Machine>
    ): Promise<Machine> {
        return loaderResult(await MachineLoader.load(id.toString()));
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetMachines })
    )
    @Query(() => MachineList)
    async machines(
        @Arg('filter', () => MachineFilter) filter: MachineFilter
    ): Promise<MachineList> {
        return await Paginate.paginate({
            model: MachineModel,
            query: filter.serializeMachineFilter(),
            skip: filter.skip,
            take: filter.take,
            sort: { name: 1 },
        });
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateMachine })
    )
    @Mutation(() => Machine)
    async createMachine(
        @Ctx() context: Context,
        @Arg('data', () => CreateMachineInput) data: CreateMachineInput
    ): Promise<Machine> {
        const doc = await MachineModel.create({ ...data, ...context.base });
        return doc.toJSON() as unknown as Machine;
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.UpdateMachine })
    )
    @Mutation(() => Machine)
    async updateMachine(
        @Ctx() context: Context,
        @Arg('id', () => ObjectIdScalar) _id: Ref<Machine>,
        @Arg('data', () => UpdateMachineInput) data: UpdateMachineInput
    ): Promise<Machine> {
        const doc = await MachineModel.findOneAndUpdate(
            { _id: _id.toString() },
            {
                ...data,
                modified_by: context.base.modified_by,
                date_modified: context.base.date_modified,
            },
            {
                new: true,
            }
        );
        return doc.toJSON() as unknown as Machine;
    }

    @FieldResolver(() => [AppFile])
    async files(
        @Ctx() { storage }: Context,
        @Root() { _id }: Machine
    ): Promise<AppFile[]> {
        const files = await storage.files(
            StorageBucket.Documents,
            _id.toString()
        );

        return files.map((file) => AppFile.fromFile(file, _id.toString()));
    }

    @FieldResolver(() => AppFile, { nullable: true })
    async photo(
        @Ctx() { storage }: Context,
        @Root() { _id }: Machine
    ): Promise<AppFile> {
        const files = await storage.files(
            StorageBucket.Documents,
            _id.toString()
        );

        const match = files[0];

        if (!match) return null;

        return AppFile.fromFile(match, _id.toString());
    }
}
