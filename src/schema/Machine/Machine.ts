import { getBaseLoader } from '@src/schema/Loader';
import { Base } from '@src/schema/Base/Base';
import {
    modelOptions,
    prop,
    Ref,
    getModelForClass,
} from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';

@modelOptions({
    schemaOptions: {
        collection: 'machines',
    },
})
@ObjectType()
export class Machine extends Base {
    @Field()
    @prop({ required: true })
    name: string;

    @Field({ nullable: true })
    @prop({ required: false })
    description?: string;

    @Field({ nullable: true })
    @prop({ required: false })
    link?: string;

    @Field({ nullable: true })
    @prop({ required: false })
    part_number?: string;

    @Field(() => Machine, { nullable: true })
    @prop({ required: false, ref: () => Machine })
    parent?: Ref<Machine>;
}

export const MachineModel = getModelForClass(Machine);

export const MachineLoader = getBaseLoader(MachineModel);
