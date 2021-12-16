import { Field, ObjectType } from 'type-graphql';

export enum SignedUrlType {
    Read = 'Read',
    Write = 'Write',
}

export enum SignedUrlCategory {
    Company = 'Company',
}

@ObjectType()
export class SignedUrl {
    @Field()
    expires: Date;

    @Field()
    url: string;

    @Field()
    filename: string;

    @Field(() => SignedUrlType)
    type: SignedUrlType;
}
