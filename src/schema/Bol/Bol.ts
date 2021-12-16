import { getBaseLoader } from './../Loader';
import { Base } from './../Base/Base';
import { Fulfillment } from '../Fulfillment/Fulfillment';
import { ItemContent } from '../Content/Content';
import {
    prop,
    Ref,
    getModelForClass,
    modelOptions,
    Severity,
} from '@typegoose/typegoose';
import { Company } from '../Company/Company';
import { Location } from '../Location/Location';
import { createUnionType, Field, ObjectType } from 'type-graphql';

@ObjectType()
export class BolAppointmentBase {
    @Field({ nullable: true })
    @prop({ required: false })
    date?: Date;
}

@ObjectType()
export class BolAppointment_Company extends BolAppointmentBase {
    @prop({ required: true })
    type!: 'Company';

    @Field(() => Company)
    @prop({ required: true })
    company!: Ref<Company>;
}

@ObjectType()
export class BolAppointment_Location extends BolAppointmentBase {
    @prop({ required: true })
    type!: 'Location';

    @Field(() => Location)
    @prop({ required: true })
    location!: Ref<Location>;
}

export const BolAppointment = createUnionType({
    name: 'BolAppointment',
    types: () => [BolAppointment_Company, BolAppointment_Location] as const,
    resolveType: (value) => {
        switch (value.type) {
            case 'Company':
                return BolAppointment_Company;
            case 'Location':
                return BolAppointment_Location;
        }
    },
});

@modelOptions({
    schemaOptions: {
        collection: 'bols',
    },
    options: {
        allowMixed: Severity.ALLOW,
    },
})
@ObjectType()
export class Bol extends Base {
    @Field(() => BolAppointment, { nullable: true })
    @prop({ required: false })
    from?: BolAppointment_Company | BolAppointment_Location;

    @Field(() => BolAppointment, { nullable: true })
    @prop({ required: false })
    to?: BolAppointment_Company | BolAppointment_Location;

    @Field(() => [ItemContent], { nullable: true })
    @prop({ required: true, type: () => ItemContent })
    contents!: ItemContent[];

    @Field(() => [Fulfillment])
    shipments?: Fulfillment[];

    @Field(() => [Fulfillment])
    receipts?: Fulfillment[];
}

export const BolModel = getModelForClass(Bol);
export const BolLoader = getBaseLoader(BolModel);
