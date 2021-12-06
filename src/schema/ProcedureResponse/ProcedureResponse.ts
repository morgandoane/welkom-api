import { Profile } from './../Profile/Profile';
import { ProcedureStepResponse } from '../ProcedureStep/ProcedureStep';
import { getModelForClass, prop, Ref } from '@typegoose/typegoose';
import { Configured } from '../Configured/Configured';
import { Procedure } from '../Procedure/Procedure';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class ProcedureAssignment {
    @Field(() => Profile)
    @prop({ required: true })
    user: string;

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
