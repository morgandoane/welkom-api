import { Unit } from '../Unit/Unit';
import { prop, Ref } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class Instruction {
    @Field()
    @prop({ required: true })
    english!: string;

    @Field()
    @prop({ required: true })
    spanish!: string;
}

@ObjectType()
export class ProcedureStep {
    @Field(() => Instruction, { nullable: true })
    @prop({ required: false })
    instruction?: Instruction;
}

@ObjectType()
export class ProcedureStepResponse {
    @Field(() => ProcedureStep)
    @prop({ required: true, ref: () => ProcedureStep })
    step!: Ref<ProcedureStep>;

    @Field({ nullable: true })
    @prop({ required: false })
    note?: string;
}
