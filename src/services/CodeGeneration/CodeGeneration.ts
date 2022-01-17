import { LotModel } from './../../schema/Lot/Lot';
import { OrderModel } from './../../schema/Order/Order';
import { ItineraryModel } from '@src/schema/Itinerary/Itinerary';
import crypto from 'crypto';

export enum CodeType {
    PO = 'P',
    BOL = 'B',
    ITIN = 'I',
    LOT = 'L',
}

export class CodeGenerator {
    public static async generate(type: CodeType): Promise<string> {
        return await this.obtain(type);
    }

    public static async isDuplicate(
        type: CodeType,
        attempt: string
    ): Promise<boolean> {
        return await this.check(type, attempt);
    }

    private static async obtain(type: CodeType): Promise<string> {
        const attempt = crypto.randomBytes(3).toString('hex').toUpperCase();
        const codeAttempt = `${attempt}${type}`;
        switch (type) {
            case CodeType.BOL: {
                const match = await ItineraryModel.findOne({
                    'bols.code': codeAttempt,
                });
                if (match) return await this.obtain(type);
                else return codeAttempt;
            }
            case CodeType.ITIN: {
                const match = await ItineraryModel.findOne({
                    code: codeAttempt,
                });
                if (match) return await this.obtain(type);
                else return codeAttempt;
            }
            case CodeType.LOT: {
                const match = await LotModel.findOne({
                    code: codeAttempt,
                });
                if (match) return await this.obtain(type);
                else return codeAttempt;
            }
            case CodeType.PO: {
                const match = await OrderModel.findOne({
                    code: codeAttempt,
                });
                if (match) return await this.obtain(type);
                else return codeAttempt;
            }
        }
    }

    private static async check(
        type: CodeType,
        attempt: string
    ): Promise<boolean> {
        switch (type) {
            case CodeType.BOL: {
                const match = await ItineraryModel.findOne({
                    'bols.code': type + attempt,
                });
                if (match) return true;
                else return false;
            }
            case CodeType.ITIN: {
                const match = await ItineraryModel.findOne({
                    code: type + attempt,
                });
                if (match) return true;
                else return false;
            }
            case CodeType.LOT: {
                const match = await LotModel.findOne({
                    code: type + attempt,
                });
                if (match) return true;
                else return false;
            }
            case CodeType.PO: {
                const match = await OrderModel.findOne({
                    code: type + attempt,
                });
                if (match) return true;
                else return false;
            }
        }
    }
}
