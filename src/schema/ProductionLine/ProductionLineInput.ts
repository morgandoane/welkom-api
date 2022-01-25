import { UserInputError } from 'apollo-server-errors';
import { CompanyLoader } from './../Company/Company';
import { loaderResult } from '@src/utils/loaderResult';
import { Context } from '@src/auth/context';
import { Field, InputType } from 'type-graphql';
import { ProductionLine } from './ProductionLine';
import { LocationLoader } from '../Location/Location';

@InputType()
export class CreateProductionLineInput {
    @Field()
    name!: string;

    @Field()
    location!: string;

    @Field()
    company!: string;

    public async validate({ base }: Context): Promise<ProductionLine> {
        const location = loaderResult(await LocationLoader.load(this.location));
        const company = loaderResult(await CompanyLoader.load(this.company));

        if (location.company.toString() !== company._id.toString()) {
            throw new UserInputError('Company does not match location');
        }

        return {
            ...base,
            name: this.name,
            location: location._id,
            company: company._id,
        };
    }
}

@InputType()
export class UpdateProductionLineInput {
    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    deleted?: boolean;

    public async validate({ base }: Context): Promise<Partial<ProductionLine>> {
        const res: Partial<ProductionLine> = {};

        if (this.name) res.name = this.name;
        if (this.deleted !== null && this.deleted !== undefined)
            res.deleted = this.deleted;
        return res;
    }
}
