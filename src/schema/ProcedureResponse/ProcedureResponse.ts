import { ProcedureStepResponse } from '../ProcedureStep/ProcedureStep';
import { getModelForClass, prop, Ref } from '@typegoose/typegoose';
import { Configured } from '../Configured/Configured';
import { Procedure } from '../Procedure/Procedure';
import { Field, ObjectType } from 'type-graphql';
import { User } from '../User/User';

@ObjectType()
export class ProcedureAssignment {
    @Field(() => User)
    @prop({ required: true })
    user: Ref<User>;

    @Field({ nullable: true })
    @prop({ required: false })
    date?: Date;
}

@ObjectType()
export class ProcedureResponse extends Configured {
    @Field(() => Procedure)
    @prop({ required: true, ref: () => Procedure })
    procedure!: Ref<Procedure>;

    @Field(() => ProcedureAssignment, { nullable: true })
    @prop({ required: false })
    assignment?: ProcedureAssignment;

    @Field(() => [ProcedureStepResponse])
    @prop({ required: true, type: () => ProcedureStepResponse })
    steps!: ProcedureStepResponse[];
}

export const ProcedureResponseModel = getModelForClass(ProcedureResponse);
