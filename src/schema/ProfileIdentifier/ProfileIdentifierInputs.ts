import {
    CodeGenerator,
    CodeType,
} from './../../services/CodeGeneration/CodeGeneration';
import { UserInputError } from 'apollo-server-errors';
import { UserRole } from './../../auth/UserRole';
import { loaderResult } from './../../utils/loaderResult';
import {
    AuthProvider,
    UserLoader,
} from './../../services/AuthProvider/AuthProvider';
import { Context } from './../../auth/context';
import { Field, InputType } from 'type-graphql';
import { ProfileIdentifier } from './ProfileIdentifier';

@InputType()
export class ProfileIdentifierInput {
    @Field()
    profile!: string;

    public async validate(context: Context): Promise<ProfileIdentifier> {
        const profile = loaderResult(await UserLoader.load(this.profile));
        const roles = await AuthProvider.getUserRoles({ id: profile.user_id });

        return {
            ...context.base,
            profile: profile.user_id || '',
            code: await CodeGenerator.generate(CodeType.ID),
        };
    }
}
