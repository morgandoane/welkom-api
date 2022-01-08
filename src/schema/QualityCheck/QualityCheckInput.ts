import { Context } from '@src/auth/context';
import { PromptInput } from './../Prompt/PromptInput';
import { Field, InputType } from 'type-graphql';
import { QualityCheck } from './QualityCheck';
import { loaderResult } from '@src/utils/loaderResult';
import { ItemLoader } from '../Item/Item';

@InputType()
export class CreateQualityCheckInput {
    @Field()
    item!: string;

    @Field(() => PromptInput)
    prompt!: PromptInput;

    public async validate({ base }: Context): Promise<QualityCheck> {
        const item = loaderResult(await ItemLoader.load(this.item));
        return {
            ...base,
            item: item._id,
            prompt: this.prompt.serializePromptInput(),
        };
    }
}

@InputType()
export class UpdateQualityCheckInput {
    @Field({ nullable: true })
    item?: string;

    @Field({ nullable: true })
    deleted?: boolean;

    @Field(() => PromptInput, { nullable: true })
    prompt?: PromptInput;

    public async validate({ base }: Context): Promise<Partial<QualityCheck>> {
        const res: Partial<QualityCheck> = {
            modified_by: base.modified_by,
            date_modified: base.date_modified,
        };

        if (this.item) {
            const item = loaderResult(await ItemLoader.load(this.item));
            res.item = item._id;
        }

        if (this.prompt) {
            res.prompt = this.prompt.serializePromptInput();
        }

        if (this.deleted !== null && this.deleted !== undefined) {
            res.deleted = this.deleted;
        }

        return res;
    }
}
