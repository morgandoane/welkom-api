import { PromptInput } from './../schema/Prompt/PromptInput';
import { Context } from '@src/auth/context';
import { env } from '@src/config';
import { createConnection } from './legacyConnection';
import {
    modelOptions,
    prop,
    getModelForClass,
    Ref,
    mongoose,
} from '@typegoose/typegoose';
import { CreateQualityCheckInput } from '@src/schema/QualityCheck/QualityCheckInput';
import { Item, ItemLoader } from '@src/schema/Item/Item';
import { PromptType } from '@src/schema/Prompt/Prompt';
import { loaderResult } from '@src/utils/loaderResult';

const connection = createConnection(env.LEGACY_ATLAS_URL);

@modelOptions({
    schemaOptions: {
        collection: 'qualitychecks',
    },
    existingConnection: connection,
})
export class LegacyQualityCheck {
    @prop({ required: true })
    _id: mongoose.Types.ObjectId;

    @prop({ required: true })
    question: string;

    @prop({ required: true })
    allowFail: boolean;

    @prop({ required: false })
    optionValues?: string[];

    @prop({ required: false })
    optionPassValues?: string[];

    @prop({ required: false })
    passRange?: number[];

    @prop({
        required: true,
        enum: ['shipment', 'container', 'lot'],
        default: 'lot',
    })
    location: string;

    @prop({ required: true, enum: ['options', 'range', 'text'] })
    validationType: string;

    @prop({ required: true, default: true })
    active: boolean;

    public async convert(
        { base }: Context,
        item: Ref<Item>
    ): Promise<CreateQualityCheckInput | null> {
        switch (this.validationType) {
            case 'options':
                return null;

            case 'range': {
                const prompt: PromptInput = {
                    type: PromptType.Number,
                    phrase: this.question,
                    valid_boolean: undefined,
                    valid_range: this.passRange
                        ? {
                              min: this.passRange[0],
                              max: this.passRange[1],
                          }
                        : undefined,
                    serializePromptInput: () => ({
                        type: PromptType.Number,
                        phrase: this.question,
                        valid_boolean: undefined,
                        valid_range: this.passRange
                            ? {
                                  min: this.passRange[0],
                                  max: this.passRange[1],
                              }
                            : undefined,
                    }),
                };
                return {
                    item: item.toString(),
                    prompt,
                    validate: async () => {
                        const it = loaderResult(
                            await ItemLoader.load(item.toString())
                        );
                        return {
                            ...base,
                            item: it._id,
                            prompt: prompt.serializePromptInput(),
                        };
                    },
                };
            }
            case 'text': {
                const prompt: PromptInput = {
                    type: PromptType.Text,
                    phrase: this.question,
                    valid_boolean: undefined,
                    valid_range: undefined,
                    serializePromptInput: () => ({
                        type: PromptType.Text,
                        phrase: this.question,
                        valid_boolean: undefined,
                        valid_range: undefined,
                    }),
                };
                return {
                    item: item.toString(),
                    prompt,
                    validate: async () => {
                        const it = loaderResult(
                            await ItemLoader.load(item.toString())
                        );
                        return {
                            ...base,
                            item: it._id,
                            prompt: prompt.serializePromptInput(),
                        };
                    },
                };
            }
        }
    }
}
