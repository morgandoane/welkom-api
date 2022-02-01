import { Field, InputType } from 'type-graphql';

@InputType()
export class NamesInput {
    @Field()
    english!: string;

    @Field()
    spanish!: string;
}

@InputType()
export class NamesPluralInput extends NamesInput {
    @Field()
    english_plural!: string;

    @Field()
    spanish_plural!: string;
}
