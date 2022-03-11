import { Context } from '@src/auth/context';
import { Base } from '@src/schema/Base/Base';
import { OrderQueuePreference } from './categories/OrderQueuePreference';
import { prop, getModelForClass } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class UserPreference extends Base {
    @Field(() => OrderQueuePreference, { nullable: true })
    @prop({ required: false })
    orderQueue!: OrderQueuePreference | null;

    public static async getForUser({ base }: Context): Promise<UserPreference> {
        const doc = await UserPreferenceModel.findOne({
            created_by: base.created_by,
        });

        if (doc) return doc.toJSON() as unknown as UserPreference;

        const newDoc: UserPreference = { ...base, orderQueue: null };

        const res = await UserPreferenceModel.create(newDoc);

        return res.toJSON() as unknown as UserPreference;
    }

    public static async setPreferences(
        context: Context,
        update: Partial<UserPreference>
    ): Promise<UserPreference> {
        const doc = await this.getForUser(context);
        const res = await UserPreferenceModel.findByIdAndUpdate(
            doc._id,
            update,
            { new: true }
        );

        return res.toJSON() as unknown as UserPreference;
    }
}

export const UserPreferenceModel = getModelForClass(UserPreference);
