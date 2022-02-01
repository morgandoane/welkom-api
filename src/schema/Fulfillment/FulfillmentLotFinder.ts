import { PalletConfigurationInput } from './../PalletConfiguration/PalletConfigurationInput';
import { FulfillmentContent } from './../FulfillmentContent/FulfillmentContent';
import { QualityCheckModel } from './../QualityCheck/QualityCheck';
import { QualityCheckResponseInput } from './../QualityCheckResponse/QualityCheckResponseInput';
import { UnitLoader } from './../Unit/Unit';
import { Context } from './../../auth/context';
import { isId } from './../../utils/isId';
import { Item, ItemLoader } from './../Item/Item';
import { Ref } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { Company } from '../Company/Company';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { Min } from 'class-validator';
import { Unit } from '../Unit/Unit';
import { Lot, LotModel } from '../Lot/Lot';
import { UnitClass } from '../Unit/UnitClass';
import { BaseUnit } from '../Unit/BaseUnit';
import { UserInputError } from 'apollo-server-core';
import { FulfillmentType } from './Fulfillment';
import { QualityCheckResponse } from '../QualityCheckResponse/QualityCheckResponse';
import { getId } from '@src/utils/getId';

@InputType()
export class FulfillmentLotFinder {
    @Field()
    fulfilllment_type!: FulfillmentType;

    @Field()
    identifier!: string;

    @Field(() => ObjectIdScalar)
    company!: Ref<Company>;

    @Field(() => ObjectIdScalar)
    item!: Ref<Item>;

    @Min(0)
    @Field()
    client_quantity!: number;

    @Field(() => ObjectIdScalar)
    client_unit!: Ref<Unit>;

    @Field(() => PalletConfigurationInput)
    pallet_configuration!: PalletConfigurationInput;

    @Field(() => [QualityCheckResponseInput])
    quality_check_responses!: QualityCheckResponseInput[];

    public async getExecutable(
        context: Context
    ): Promise<() => Promise<{ content: FulfillmentContent; lot: Lot }>> {
        const unit = await UnitLoader.load(this.client_unit, true);
        const item = await ItemLoader.load(this.item, true);

        const quantity =
            this.client_quantity * unit.to_base_unit * item.per_base_unit;

        const qualityChecks = await QualityCheckModel.find({
            quality_check_category: this.fulfilllment_type,
            deleted: false,
            item: item._id,
        });

        const requiredChecks = qualityChecks.filter((qc) => qc.required);

        if (
            !requiredChecks.every((check) => {
                const match = this.quality_check_responses.find(
                    (res) =>
                        res.quality_check.toString() == check._id.toString()
                );

                if (!match) return false;
                if (match.response == null || match.response == '')
                    return false;

                return true;
            })
        )
            throw new UserInputError(
                'Please provide repsonses to all required quality checks.'
            );

        switch (unit.unit_class) {
            case UnitClass.Count: {
                if (item.base_unit !== BaseUnit.Count)
                    throw new UserInputError(
                        'Cannout use count unit for item with id ' +
                            this.item.toString()
                    );
                break;
            }
            case UnitClass.Weight:
            case UnitClass.Volume: {
                if (item.base_unit === BaseUnit.Count)
                    throw new UserInputError(
                        'Cannout use non-count unit for item with id ' +
                            this.item.toString()
                    );
                break;
            }
        }
        const match = await LotModel.findOne(
            isId(this.identifier)
                ? {
                      _id: this.identifier,
                      company: this.company,
                      item: this.item,
                  }
                : {
                      code: this.identifier,
                      company: this.company,
                      item: this.item,
                  }
        );

        const quality_check_responses: QualityCheckResponse[] = [];

        for (const response of this.quality_check_responses) {
            quality_check_responses.push(await response.validate());
        }

        if (match)
            return async () => ({
                lot: match,
                content: {
                    pallet_configuration: this.pallet_configuration,
                    quantity,
                    client_quantity: this.client_quantity,
                    client_unit: this.client_unit,
                    quality_check_responses,
                    lot: match._id,
                    base_unit: item.base_unit,
                    ...getId(),
                },
            });

        const newLot: Lot = {
            ...context.base,
            code: this.identifier,
            company: this.company,
            item: this.item,
            contents: [],
            quantity,
            base_unit: item.base_unit,
            expense_summaries: null,
            expenses: [],
            location: null,
            production_line: null,
        };

        return async () => ({
            lot: await LotModel.create(newLot),
            content: {
                pallet_configuration: this.pallet_configuration,
                quantity,
                client_quantity: this.client_quantity,
                client_unit: this.client_unit,
                quality_check_responses,
                lot: match._id,
                base_unit: item.base_unit,
                ...getId(),
            },
        });
    }
}
