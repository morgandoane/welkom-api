import { mongoose, prop } from '@typegoose/typegoose';

export class _Base {
    @prop({ required: true })
    _id!: mongoose.Types.ObjectId;

    @prop({ required: true })
    date_created!: Date;

    @prop({ required: false })
    date_modified?: Date;

    @prop({ required: true })
    created_by!: string;

    @prop({ required: false })
    modified_by?: string;

    @prop({ required: true, default: false })
    deleted!: boolean;
}
