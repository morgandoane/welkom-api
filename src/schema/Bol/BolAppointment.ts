import { CompanyLoader } from './../Company/Company';
import { Location, LocationLoader } from './../Location/Location';
import { prop, Ref, mongoose } from '@typegoose/typegoose';
import { Field, ObjectType, InputType, ID } from 'type-graphql';
import { Company } from '../Company/Company';
import { loaderResult } from '@src/utils/loaderResult';

@ObjectType()
export class BolAppointment {
    @Field(() => ID)
    @prop({ required: true })
    _id!: mongoose.Types.ObjectId;

    @Field(() => Company)
    @prop({ required: true, ref: () => Company })
    company!: Ref<Company>;

    @Field(() => Location, { nullable: true })
    @prop({ required: false, ref: () => Location })
    location?: Ref<Location>;

    @Field()
    @prop({ required: true })
    date!: Date;
}

@InputType()
export class BolAppointmentInput {
    @Field()
    company!: string;

    @Field({ nullable: true })
    location?: string;

    @Field()
    date!: Date;

    public async validateAppointment(): Promise<BolAppointment> {
        const company = loaderResult(await CompanyLoader.load(this.company));
        if (this.location) {
            const location = loaderResult(
                await LocationLoader.load(this.location)
            );
        }

        return {
            _id: new mongoose.Types.ObjectId(),
            company: company._id,
            date: this.date,
            location: this.location
                ? new mongoose.Types.ObjectId(this.location)
                : undefined,
        };
    }
}
