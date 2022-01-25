import { ProductionLineLoader } from './../ProductionLine/ProductionLine';
import { Context } from './../../auth/context';
import { UserLoader } from './../../services/AuthProvider/AuthProvider';
import { LocationLoader } from './../Location/Location';
import { MixingCardLineInput } from './../MixingCardLine/MixingCardLineInputs';
import { Field, InputType } from 'type-graphql';
import { MixingCard } from './MixingCard';
import { loaderResult } from '@src/utils/loaderResult';

@InputType()
export class CreateMixingCardInput {
    @Field()
    location!: string;

    @Field()
    production_line?: string;

    @Field()
    profile!: string;

    @Field(() => [MixingCardLineInput])
    lines!: MixingCardLineInput[];

    public async validateCard({ base }: Context): Promise<MixingCard> {
        const location = loaderResult(await LocationLoader.load(this.location));
        const profile = loaderResult(await UserLoader.load(this.profile));

        const productionLine = this.production_line
            ? loaderResult(
                  await ProductionLineLoader.load(this.production_line)
              )
            : null;

        const res: MixingCard = {
            ...base,
            location: location._id,
            profile: profile.user_id || '',
            production_line: productionLine ? productionLine._id : null,
            lines: [],
        };

        for (const line of this.lines) {
            res.lines.push(await line.validateLine());
        }

        return res;
    }
}

@InputType()
export class UpdateMixingCardInput {
    @Field({ nullable: true })
    deleted?: boolean;

    @Field({ nullable: true })
    location?: string;

    @Field({ nullable: true })
    production_line?: string;

    @Field({ nullable: true })
    profile?: string;

    @Field(() => [MixingCardLineInput], { nullable: true })
    lines?: MixingCardLineInput[];

    public async validateCardUpdate({
        base,
    }: Context): Promise<Partial<MixingCard>> {
        const res: Partial<MixingCard> = {
            date_modified: base.date_modified,
            modified_by: base.modified_by,
        };

        if (this.location) {
            const location = loaderResult(
                await LocationLoader.load(this.location)
            );

            res.location = location._id;
        }

        if (this.production_line) {
            const line = loaderResult(
                await ProductionLineLoader.load(this.production_line)
            );

            res.production_line = line._id;
        }

        if (this.profile) {
            const profile = loaderResult(await UserLoader.load(this.profile));

            res.profile = profile.user_id || '';
        }

        if (this.deleted !== undefined && this.deleted !== null) {
            res.deleted = this.deleted;
        }

        if (this.lines) {
            res.lines = [];

            for (const line of this.lines) {
                res.lines.push(await line.validateLine());
            }
        }

        return res;
    }
}
