import { Fulfillment } from '../Fulfillment/Fulfillment';
import { ItemContent } from '../Content/Content';
import { prop, Ref } from '@typegoose/typegoose';
import { Company } from '../Company/Company';
import { Configured } from '../Configured/Configured';
import { Location } from '../Location/Location';
import { createUnionType, Field, ObjectType } from 'type-graphql';

@ObjectType()
class BolAppointmentBase {
    @Field({ nullable: true })
    @prop({ required: false })
    date?: Date;
}

@ObjectType()
class BolAppointment_Company extends BolAppointmentBase {
    @prop({ required: true })
    type!: 'Company';

    @Field(() => Company)
    @prop({ required: true })
    company!: Ref<Company>;
}

@ObjectType()
class BolAppointment_Location extends BolAppointmentBase {
    @prop({ required: true })
    type!: 'Location';

    @Field(() => Location)
    @prop({ required: true })
    location!: Ref<Location>;
}

export const BolAppointment = createUnionType({
    name: 'BolAppointment',
    types: () => [BolAppointment_Company, BolAppointment_Location] as const,
});

@ObjectType()
export class Bol extends Configured {
    @Field(() => BolAppointment, { nullable: true })
    @prop({ required: false })
    from?: BolAppointment_Company | BolAppointment_Location;

    @Field(() => BolAppointment, { nullable: true })
    @prop({ required: false })
    to?: BolAppointment_Company | BolAppointment_Location;

    @Field(() => ItemContent, { nullable: true })
    @prop({ required: false })
    content?: ItemContent;

    @Field(() => [Fulfillment])
    @prop({ required: true })
    shipments!: Fulfillment[];

    @Field(() => [Fulfillment])
    @prop({ required: true })
    receipts!: Fulfillment[];
}
