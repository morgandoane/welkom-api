import { Context } from './../../auth/context';
import {
    ConfiguredInput,
    UpdateConfiguredInput,
} from './../Configured/ConfiguredInput';
import { ItemContentInput } from './../Content/ContentInputs';
import { LocationLoader } from './../Location/Location';
import { CompanyLoader } from './../Company/Company';
import { loaderResult } from './../../utils/loaderResult';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { Field, InputType } from 'type-graphql';
import { ObjectId, UpdateQuery } from 'mongoose';
import { Bol, BolAppointment_Company, BolAppointment_Location } from './Bol';
import { DocumentType } from '@typegoose/typegoose';

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
export class CreateBolInput extends ConfiguredInput {
    @Field(() => BolAppointmentInput, { nullable: true })
    from?: BolAppointmentInput;

    @Field(() => BolAppointmentInput, { nullable: true })
    to?: BolAppointmentInput;

    @Field(() => [ItemContentInput], { nullable: true })
    contents?: ItemContentInput[];

    public async validateBol(context: Context): Promise<Bol> {
        const configured = await this.validate(context);

        const bol: Bol = {
            ...configured,
            contents: [],
        };

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

        return bol;
    }
}

@InputType()
export class UpdateBolInput extends UpdateConfiguredInput {
    @Field(() => BolAppointmentInput, { nullable: true })
    from?: BolAppointmentInput;

    @Field(() => BolAppointmentInput, { nullable: true })
    to?: BolAppointmentInput;

    @Field(() => [ItemContentInput], { nullable: true })
    contents?: ItemContentInput[];

    public async serializeBolUpdate(): Promise<UpdateQuery<Bol>> {
        const bolUpdate: UpdateQuery<DocumentType<Bol>> = {
            ...(await this.serializeConfiguredUpdate()),
            from:
                this.from !== undefined
                    ? await this.from.validate()
                    : undefined,
            to: this.to !== undefined ? await this.to.validate() : undefined,
            contents:
                this.contents !== undefined
                    ? await Promise.all(
                          this.contents.map((content) =>
                              content.validateItemContent()
                          )
                      )
                    : undefined,
        };

        return bolUpdate;
    }
}
