import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class SignedUrl {
    @Field()
    url: string;

    @Field()
    timestamp: Date;
}
