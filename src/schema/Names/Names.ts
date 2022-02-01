import { prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class Names {
    @Field()
    @prop({ required: true, minlength: 3 })
    english!: string;

    @Field()
    @prop({ required: true, minlength: 3 })
    spanish!: string;
}

@ObjectType()
export class NamesPlural extends Names {
    @Field()
    @prop({ required: true, minlength: 3 })
    english_plural!: string;

    @Field()
    @prop({ required: true, minlength: 3 })
    spanish_plural!: string;
}
