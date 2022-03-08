import { ObjectIdScalar } from '@src/schema/ObjectIdScalar/ObjectIdScalar';
import { Context } from '@src/auth/context';
import { Field, InputType } from 'type-graphql';
import { Design, DesignCategory, DesignLocation } from './Design';
import { Ref } from '@typegoose/typegoose';

@InputType()
export class CreateDesignInput {
    @Field()
    part_number!: string;

    @Field(() => DesignLocation)
    location!: DesignLocation;

    @Field(() => DesignCategory)
    category!: DesignCategory;

    @Field(() => ObjectIdScalar, { nullable: true })
    parent!: Ref<Design> | null;

    @Field({ nullable: true })
    description?: string | null;

    public async validateDesign(context: Context): Promise<Design> {
        return {
            ...context.base,
            ...this,
        };
    }
}
