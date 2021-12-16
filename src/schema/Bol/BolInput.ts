import { Context } from './../../auth/context';
import { ItemContentInput } from './../Content/ContentInputs';
import { LocationLoader } from './../Location/Location';
import { CompanyLoader } from './../Company/Company';
import { loaderResult } from './../../utils/loaderResult';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { Field, InputType } from 'type-graphql';
import { ObjectId } from 'mongoose';
import { Bol, BolAppointment_Company, BolAppointment_Location } from './Bol';

export enum BolAppointmentType {
    Company = 'Company',
    Location = 'Location',
}

@InputType()
export class BolAppointmentInput {
    @Field(() => BolAppointmentType)
    type!: BolAppointmentType;

    @Field(() => ObjectIdScalar)
    target!: ObjectId;

    public async validate(): Promise<
        BolAppointment_Company | BolAppointment_Location
    > {
        if (this.type == BolAppointmentType.Company) {
            const company = loaderResult(
                await CompanyLoader.load(this.target.toString())
            );
            return {
                type: 'Company',
                company: company._id,
            };
        } else {
            const location = loaderResult(
                await LocationLoader.load(this.target.toString())
            );
            return {
                type: 'Location',
                location: location._id,
            };
        }
    }
}

@InputType()
export class CreateBolInput {
    @Field(() => BolAppointmentInput, { nullable: true })
    from?: BolAppointmentInput;

    @Field(() => BolAppointmentInput, { nullable: true })
    to?: BolAppointmentInput;

    @Field(() => [ItemContentInput], { nullable: true })
    contents?: ItemContentInput[];

    public async validateBol(context: Context): Promise<Partial<Bol>> {
        const bol: Partial<Bol> = {};

        if (this.from) {
            bol.from = await this.from.validate();
        }

        if (this.to) {
            bol.to = await this.to.validate();
        }

        if (this.contents) {
            for (const content of this.contents) {
                bol.contents.push(await content.validateItemContent());
            }
        }

        bol.modified_by = context.base.modified_by;
        bol.date_modified = context.base.date_modified;

        return bol;
    }
}

@InputType()
export class UpdateBolInput {
    @Field(() => BolAppointmentInput, { nullable: true })
    from?: BolAppointmentInput;

    @Field(() => BolAppointmentInput, { nullable: true })
    to?: BolAppointmentInput;

    @Field(() => [ItemContentInput], { nullable: true })
    contents?: ItemContentInput[];

    public async serializeBolUpdate(): Promise<Partial<Bol>> {
        const bolUpdate: Partial<Bol> = {};

        if (this.from) bolUpdate.from = await this.from.validate();

        if (this.to) bolUpdate.to = await this.to.validate();

        if (this.contents) {
            this.contents = [];
            for (const content of this.contents) {
                bolUpdate.contents.push(await content.validateItemContent());
            }
        }

        return bolUpdate;
    }
}
