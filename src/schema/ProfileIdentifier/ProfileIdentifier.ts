import { Profile } from './../Profile/Profile';
import { getBaseLoader } from './../Loader';
import { Base } from './../Base/Base';
import { Field, ObjectType } from 'type-graphql';
import { modelOptions, prop, getModelForClass } from '@typegoose/typegoose';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'profileIdentifiers',
    },
})
export class ProfileIdentifier extends Base {
    @prop({ required: true })
    profile!: string;

    @Field()
    @prop({ required: true })
    code!: string;
}

export const ProfileIdentifierModel = getModelForClass(ProfileIdentifier);
export const ProfileIdentifierLoader = getBaseLoader(ProfileIdentifierModel);
