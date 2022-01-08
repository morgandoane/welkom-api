import { Context } from './../../auth/context';
import { Field, InputType } from 'type-graphql';
import { Verification, VerificationStatus } from './Verification';

@InputType()
export class CreateVerificationInput {
    @Field(() => VerificationStatus)
    status!: VerificationStatus;

    @Field({ nullable: true })
    notes?: string;

    public validate(context: Context): Verification {
        return { ...context.base, status: this.status, notes: this.notes };
    }
}

@InputType()
export class UpdateVerificationInput {
    @Field(() => VerificationStatus, { nullable: true })
    status!: VerificationStatus;

    @Field({ nullable: true })
    notes?: string;

    @Field({ nullable: true })
    deleted?: boolean;

    public serialize({ base }: Context): Partial<Verification> {
        const res: Partial<Verification> = {
            modified_by: base.modified_by,
            date_modified: base.date_modified,
        };

        if (this.status) res.status = this.status;
        if (this.notes) res.notes = this.notes;
        if (this.deleted !== undefined && this.deleted !== null)
            res.deleted = this.deleted;

        return res;
    }
}
