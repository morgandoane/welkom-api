import {
    CodeType,
    CodeGenerator,
} from './../../services/CodeGeneration/CodeGeneration';
import { Code } from './Code';
import { Arg, Query, Resolver } from 'type-graphql';

@Resolver(() => Code)
export class CodeResolvers {
    @Query(() => Code)
    async code(@Arg('type', () => CodeType) type: CodeType): Promise<Code> {
        return {
            type,
            value: await CodeGenerator.generate(type),
            date_generated: new Date(),
        };
    }
}
