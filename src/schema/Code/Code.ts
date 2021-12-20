import { CodeType } from '@src/services/CodeGeneration/CodeGeneration';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class Code {
    @Field()
    date_generated: Date;

    @Field(() => CodeType)
    type: CodeType;

    @Field()
    value: string;
}
