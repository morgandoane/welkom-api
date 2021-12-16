import { UpdateLotInput } from './../../LotInput';
import { Context } from './../../../../auth/context';
import { ProceduralLot } from './ProceduralLot';
import { ProceduralLotContentInput } from './../../../Content/ContentInputs';
import { Field, InputType } from 'type-graphql';
import { LotInput } from '../../LotInput';

@InputType()
export class ProceduralLotInput extends LotInput {
    @Field(() => [ProceduralLotContentInput])
    contents!: ProceduralLotContentInput[];

    public async validateProceduralLot(
        context: Context
    ): Promise<ProceduralLot> {
        const baseLot = await this.validateLot(context);

        const res: ProceduralLot = { ...baseLot, contents: [] };

        for (const content of this.contents) {
            res.contents.push(await content.validateProceduralLotContent());
        }

        return res;
    }
}

@InputType()
export class UpdateProceduralLotInput extends UpdateLotInput {
    @Field(() => [ProceduralLotContentInput])
    contents?: ProceduralLotContentInput[];

    public async validateProceduralLotUpdate(
        context: Context
    ): Promise<Partial<ProceduralLot>> {
        const res: Partial<ProceduralLot> = {
            ...(await this.validateLotUpdate(context)),
        };

        if (this.contents) {
            res.contents = [];
            for (const content of this.contents) {
                res.contents.push(await content.validateLotContent());
            }
        }

        return res;
    }
}
