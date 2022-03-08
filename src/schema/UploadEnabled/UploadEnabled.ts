import { AppFile } from './../AppFile/AppFile';
import { Base } from '@src/schema/Base/Base';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class UploadEnabled extends Base {
    @Field(() => [AppFile])
    files?: AppFile[];

    @Field(() => String, { nullable: true })
    photo?: string;
}
