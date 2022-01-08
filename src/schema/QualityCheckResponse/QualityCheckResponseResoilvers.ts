import {
    QualityCheck,
    QualityCheckLoader,
} from './../QualityCheck/QualityCheck';
import { QualityCheckResponse } from './QualityCheckResponse';
import { FieldResolver, Resolver, Root } from 'type-graphql';
import { loaderResult } from '@src/utils/loaderResult';

@Resolver(() => QualityCheckResponse)
export class QualityCheckResponseResolvers {
    @FieldResolver(() => QualityCheck)
    async qualityCheck(
        @Root() { qualityCheck }: QualityCheckResponse
    ): Promise<QualityCheck> {
        return loaderResult(
            await QualityCheckLoader.load(qualityCheck.toString())
        );
    }
}
