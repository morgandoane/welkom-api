import { mongoose } from '@typegoose/typegoose';

export const isId = (value: string): boolean =>
    mongoose.Types.ObjectId.isValid(value) &&
    new mongoose.Types.ObjectId(value).toString() == value;
