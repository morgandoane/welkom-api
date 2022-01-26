import { ProductionLineLoader } from './../ProductionLine/ProductionLine';
import { mongoose, Ref } from '@typegoose/typegoose';
import { LocationLoader } from './../Location/Location';
import { Company, CompanyLoader } from './../Company/Company';
import { Item, ItemLoader } from './../Item/Item';
import { loaderResult } from './../../utils/loaderResult';
import { Context } from './../../auth/context';
import { LotContentInput } from './../Content/ContentInputs';
import { Field, InputType } from 'type-graphql';
import { PalletCard } from './PalletCard';

@InputType()
export class PalletCardInput {
    @Field(() => [LotContentInput])
    contents!: LotContentInput[];

    @Field()
    item!: string;

    @Field()
    company!: string;

    @Field()
    location!: string;

    @Field({ nullable: true, defaultValue: false })
    include_trays?: boolean;

    @Field(() => [String])
    production_lines!: string[];

    public async validatePalletCard({ base }: Context): Promise<PalletCard> {
        const item = loaderResult(await ItemLoader.load(this.item));
        const company = loaderResult(await CompanyLoader.load(this.company));
        const location = loaderResult(await LocationLoader.load(this.location));

        const card = new PalletCard();

        card._id = new mongoose.Types.ObjectId();
        card.contents = [];
        card.profile = base.created_by;
        card.item = item._id;
        card.company = company._id;
        card.location = location._id;
        card.production_lines = [];
        card.include_trays = this.include_trays;
        card.closed = false;

        for (const content of this.contents) {
            card.contents.push(await content.validateLotContent());
        }

        for (const line of this.production_lines) {
            const productionLine = loaderResult(
                await ProductionLineLoader.load(line)
            );

            card.production_lines.push(productionLine._id);
        }

        return card;
    }
}
