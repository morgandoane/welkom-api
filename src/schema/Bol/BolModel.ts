import { getBaseLoader } from '@src/utils/baseLoader';
import { getModelForClass } from '@typegoose/typegoose';
import { Bol } from './Bol';

export const BolModel = getModelForClass(Bol);
export const BolLoader = getBaseLoader(BolModel);
