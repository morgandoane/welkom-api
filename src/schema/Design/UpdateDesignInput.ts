import { ObjectIdScalar } from '@src/schema/ObjectIdScalar/ObjectIdScalar';
import { Ref } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { Design, DesignCategory, DesignLocation } from './Design';

@InputType()
export class UpdateDesignInput {
    @Field({ nullable: true })
    deleted?: boolean;

    @Field({ nullable: true })
    part_number?: string;

    @Field(() => DesignLocation, { nullable: true })
    location?: DesignLocation;

    @Field(() => DesignCategory, { nullable: true })
    category?: DesignCategory;

    @Field(() => ObjectIdScalar, { nullable: true })
    parent?: Ref<Design> | null;

    @Field({ nullable: true })
    description?: string | null;

    public async serializeDesignUpdate(): Promise<Partial<Design>> {
        const res: Partial<Design> = {};

        if (this.deleted !== null && this.deleted !== undefined)
            res.deleted = this.deleted;

        if (this.part_number) res.part_number = this.part_number;
        if (this.location) res.location = this.location;
        if (this.category) res.category = this.category;
        if (this.parent) res.parent = this.parent;
        if (this.description !== undefined) res.description = this.description;

        return res;
    }
}
