import { ProcedureStep } from '../ProcedureStep/ProcedureStep';
import { getModelForClass, prop, Ref } from '@typegoose/typegoose';
import { Configured } from '../Configured/Configured';
import { Expense } from '../Expense/Expense';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class Procedure extends Configured {
    @Field()
    @prop({ required: true })
    name!: string;

    @Field(() => [ProcedureStep])
    @prop({ required: true, type: () => ProcedureStep })
    steps!: ProcedureStep[];

    @Field(() => [Expense])
    @prop({ required: true, ref: () => Expense })
    expenses!: Ref<Expense>[];
}

export const ProcedureModel = getModelForClass(Procedure);
