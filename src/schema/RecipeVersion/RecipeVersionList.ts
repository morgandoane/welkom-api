import { RecipeVersion } from './RecipeVersion';
import { Pagination } from './../Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class RecipeVersionList extends Pagination(RecipeVersion) {}
