import { Unit } from './Unit';
import { BaseFilter } from './../Base/BaseFilter';
import { Field, InputType } from 'type-graphql';
import { DocumentType } from '@typegoose/typegoose';
import { FilterQuery } from 'mongoose';

@InputType()
export class UnitFilter extends BaseFilter {
    @Field({ nullable: true })
    name?: string;

    public serializeUnitFilter(): FilterQuery<DocumentType<Unit>> {
        const query = this.serializeBaseFilter() as FilterQuery<
            DocumentType<Unit>
        >;
        if (this.name)
            query.$or = [
                { english: { $regex: new RegExp(this.name, 'i') } },
                { spanish: { $regex: new RegExp(this.name, 'i') } },
                { english_plural: { $regex: new RegExp(this.name, 'i') } },
                { spanish_plural: { $regex: new RegExp(this.name, 'i') } },
            ];
        return query;
    }
}
