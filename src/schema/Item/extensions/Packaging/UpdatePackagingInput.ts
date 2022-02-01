import { Packaging } from './Packaging';
import { InputType } from 'type-graphql';
import { UpdateItemInput } from '../../UpdateItemInput';

@InputType()
export class UpdatePackagingInput extends UpdateItemInput {
    public async serializePackagingUpdate(): Promise<Partial<Packaging>> {
        const res: Partial<Packaging> = { ...(await this.serializeItem()) };

        return res;
    }
}
