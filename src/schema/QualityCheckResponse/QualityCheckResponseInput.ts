import { UserInputError } from 'apollo-server-errors';
import {
    QualityCheck,
    QualityCheckLoader,
} from './../QualityCheck/QualityCheck';
import { Context } from '@src/auth/context';
import { ObjectIdScalar } from '@src/schema/ObjectIdScalar';
import { loaderResult } from '@src/utils/loaderResult';
import { ObjectId } from 'mongoose';
import { Field, InputType } from 'type-graphql';
import { QualityCheckResponse } from './QualityCheckResponse';
import { PromptType } from '../Prompt/Prompt';

@InputType()
export class QualityCheckResponseInput {
    @Field(() => ObjectIdScalar)
    qualityCheck!: ObjectId;

    @Field()
    response!: string;

    public async validateResponse({
        base,
    }: Context): Promise<QualityCheckResponse> {
        const check = loaderResult(
            await QualityCheckLoader.load(this.qualityCheck.toString())
        );

        const res: QualityCheckResponse = {
            ...base,
            qualityCheck: check._id,
            response: this.response,
            passed: validateResponse(check, this.response),
        };

        return res;
    }
}

const validateResponse = (check: QualityCheck, response: string): boolean => {
    switch (check.prompt.type) {
        case PromptType.Boolean: {
            if (!['true', 'false'].includes(response))
                throw new UserInputError(
                    "Boolean checks require a 'true' or 'false' response string."
                );

            const value =
                check.prompt.valid_boolean == undefined
                    ? true
                    : response == 'true';

            return value == check.prompt.valid_boolean;
        }
        case PromptType.Number: {
            const value = parseFloat(response);
            if (isNaN(value))
                throw new UserInputError(
                    'Number checks require a number response string.'
                );

            if (check.prompt.valid_range == undefined) return true;
            else
                return (
                    value <= check.prompt.valid_range.max &&
                    value >= check.prompt.valid_range.min
                );
        }
    }
    return true;
};
