import { modelOptions } from '@typegoose/typegoose';

@modelOptions({
    schemaOptions: {
        collection: 'profiles',
    },
})
export class _Profile {}
