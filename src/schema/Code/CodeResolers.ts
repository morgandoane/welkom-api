import {
    CodeType,
    CodeGenerator,
} from './../../services/CodeGeneration/CodeGeneration';
import { Permitted } from '@src/auth/middleware/Permitted';
import {
    Arg,
    Field,
    ObjectType,
    Query,
    Resolver,
    UseMiddleware,
} from 'type-graphql';

@ObjectType()
export class Code {
    @Field()
    code: string;
}

@Resolver(() => Code)
export class CodeResolvers {
    @UseMiddleware(Permitted())
    @Query(() => String)
    async code(@Arg('type', () => CodeType) type: CodeType): Promise<string> {
        return await CodeGenerator.generate(type);
    }
}
