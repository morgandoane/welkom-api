import { Context } from '@src/auth/context';
import { UnitModel } from './../schema/Unit/Unit';
import { Unit, UnitClass } from '@src/schema/Unit/Unit';
import { DocumentType } from '@typegoose/typegoose';

export const getPrimitiveUnit = async (
    unit_class: UnitClass,
    { base }: Context
): Promise<DocumentType<Unit>> => {
    const match = await UnitModel.findOne({
        class: unit_class,
        base_per_unit: 1,
    });

    if (match) return match;
    else
        switch (unit_class) {
            case UnitClass.Count: {
                const doc: Unit = {
                    ...base,
                    class: unit_class,
                    base_per_unit: 1,
                    english: 'Count',
                    english_plural: 'Counts',
                    spanish: 'Contar',
                    spanish_plural: 'Cuenta',
                };

                return await UnitModel.create(doc);
            }
            case UnitClass.Time: {
                const doc: Unit = {
                    ...base,
                    class: unit_class,
                    base_per_unit: 1,
                    english: 'Minute',
                    english_plural: 'Minutes',
                    spanish: 'Minuto',
                    spanish_plural: 'Minutos',
                };

                return await UnitModel.create(doc);
            }
            case UnitClass.Volume: {
                const doc: Unit = {
                    ...base,
                    class: unit_class,
                    base_per_unit: 1,
                    english: 'Gallon',
                    english_plural: 'Gallons',
                    spanish: 'Galón',
                    spanish_plural: 'Galones',
                };

                return await UnitModel.create(doc);
            }
            case UnitClass.Weight: {
                const doc: Unit = {
                    ...base,
                    class: unit_class,
                    base_per_unit: 1,
                    english: 'Pound',
                    english_plural: 'Pounds',
                    spanish: 'Libra',
                    spanish_plural: 'Libras',
                };

                return await UnitModel.create(doc);
            }
        }
};
