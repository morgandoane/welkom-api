import { getRandomLetter, getRandomNumber } from '@src/utils/codeGen';
import { prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { FieldType, FieldBase } from '../../Field';

export enum Glyph {
    Number = 'Number',
    Letter = 'Letter',
    Dash = 'Dash',
}

export const defaultIdentifierSchema: IdentifierField['schema'] = [
    Glyph.Number,
    Glyph.Number,
    Glyph.Number,
    Glyph.Dash,
    Glyph.Number,
    Glyph.Number,
    Glyph.Number,
];

@ObjectType()
export class IdentifierField extends FieldBase {
    @Field(() => FieldType)
    @prop({ required: true })
    type!: FieldType.Identifier;

    @Field(() => [Glyph])
    @prop({ required: true, default: defaultIdentifierSchema })
    schema!: Glyph[];
}

export const obtainRandomIdentifier = (
    schema: IdentifierField['schema']
): string => {
    let val = '';
    while (val.length !== schema.length)
        switch (schema[val.length - 1]) {
            case Glyph.Dash: {
                val += '-';
                break;
            }
            case Glyph.Letter: {
                val += getRandomLetter();
                break;
            }
            case Glyph.Number: {
                val += getRandomNumber();
                break;
            }
        }

    return val;
};
