import { RecipeVersion } from './../RecipeVersion/RecipeVersion';
import { QualityCheck } from './../QualityCheck/QualityCheck';
import { Folder } from './../Folder/Folder';
import { createUnionType, Query, Resolver } from 'type-graphql';
import { Base } from '../Base/Base';
import { Unit } from '../Unit/Unit';

export const BaseUnion = createUnionType({
    name: 'BaseUnion',
    types: () => [Folder, QualityCheck, RecipeVersion, Unit] as const,
});

@Resolver(() => Base)
export class BaseUnionResolvers {
    @Query(() => BaseUnion)
    baseUnion(): typeof BaseUnion {
        return null;
    }
}
