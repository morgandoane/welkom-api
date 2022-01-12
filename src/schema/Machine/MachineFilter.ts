import { BaseFilter } from './../Base/BaseFilter';
import { Field, InputType } from 'type-graphql';
import { Machine } from './Machine';
import { DocumentType, Ref } from '@typegoose/typegoose';
import { FilterQuery } from 'mongoose';
import { ObjectIdScalar } from '../ObjectIdScalar';

@InputType()
export class MachineFilter extends BaseFilter {
    @Field({ nullable: true })
    name?: string;

    @Field(() => ObjectIdScalar, { nullable: true })
    parent?: Ref<Machine>;

    public serializeMachineFilter(): FilterQuery<DocumentType<Machine>> {
        const filter: FilterQuery<DocumentType<Machine>> = {
            ...(this.serializeBaseFilter() as FilterQuery<
                DocumentType<Machine>
            >),
        };

        if (this.name) filter.name = { $regex: new RegExp(this.name, 'i') };
        if (this.parent !== undefined) {
            filter.parent = this.parent;
        }

        return filter;
    }
}
