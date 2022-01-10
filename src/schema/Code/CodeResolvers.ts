import {
    CodeType,
    CodeGenerator,
} from './../../services/CodeGeneration/CodeGeneration';
import { Code } from './Code';
import { Arg, Query, Resolver, UseMiddleware } from 'type-graphql';
import { Permitted } from '@src/auth/middleware/Permitted';

@Resolver(() => Code)
export class CodeResolvers {
    @UseMiddleware(Permitted())
    @Query(() => Code)
    async code(@Arg('type', () => CodeType) type: CodeType): Promise<Code> {
        return {
            type,
            value: await CodeGenerator.generate(type),
            date_generated: new Date(),
        };
    }
}
