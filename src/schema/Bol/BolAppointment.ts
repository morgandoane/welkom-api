import { CompanyLoader } from './../Company/Company';
import { Location, LocationLoader } from './../Location/Location';
import { prop, Ref, mongoose } from '@typegoose/typegoose';
import { Field, ObjectType, InputType, ID } from 'type-graphql';
import { Company } from '../Company/Company';
import { loaderResult } from '@src/utils/loaderResult';
import { ObjectIdScalar } from '../ObjectIdScalar';
import { ObjectId } from 'mongoose';

@ObjectType()
export class BolAppointment {
    @Field(() => ID)
    @prop({ required: true })
    _id!: mongoose.Types.ObjectId;

    @Field(() => Company)
    @prop({ required: true, ref: () => Company })
    company!: Ref<Company> | ObjectId;

    @Field(() => Location, { nullable: true })
    @prop({ required: false, ref: () => Location })
    location?: Ref<Location> | ObjectId;

    @Field()
    @prop({ required: true })
    date!: Date;

    @Field()
    @prop({ required: true, default: false })
    time_sensitive!: boolean;
}

@InputType()
export class BolAppointmentInput {
    @Field(() => ObjectIdScalar)
    company!: Ref<Company>;

    @Field(() => ObjectIdScalar, { nullable: true })
    location?: Ref<Location>;

    @Field()
    date!: Date;

    @Field({ nullable: true })
    time_sensitive?: boolean;

    public async validateAppointment(): Promise<BolAppointment> {
        const company = loaderResult(
            await CompanyLoader.load(this.company.toString())
        );
        if (this.location) {
            const location = loaderResult(
                await LocationLoader.load(this.location.toString())
            );
        }

        return {
            _id: new mongoose.Types.ObjectId(),
            company: company._id,
            date: this.date,
            location: this.location
                ? new mongoose.Types.ObjectId(this.location.toString())
                : undefined,
            time_sensitive: this.time_sensitive ? true : false,
        };
    }
}
