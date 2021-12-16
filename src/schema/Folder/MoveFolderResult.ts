import { Folder } from './Folder';
import { ClassType, Field, ObjectType } from 'type-graphql';

export const MoveFolderResult = <IFolder extends Folder>(
    TItemClass: ClassType<IFolder>
) => {
    @ObjectType({ isAbstract: true })
    abstract class MoveFolderResultClass {
        @Field(() => TItemClass, { nullable: true })
        origin?: IFolder;

        @Field(() => TItemClass, { nullable: true })
        destination?: IFolder;
    }
    return MoveFolderResultClass;
};
