import { modelOptions, prop, getModelForClass } from '@typegoose/typegoose';

@modelOptions({
    schemaOptions: {
        collection: 'forgeCache',
    },
})
export class ForgeCache {
    @prop({ required: true })
    urn!: string;

    @prop({ required: true })
    derivative_urn!: string;
}

export const ForgeCacheModel = getModelForClass(ForgeCache);
