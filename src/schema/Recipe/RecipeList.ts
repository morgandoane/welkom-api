import { Recipe } from './Recipe';
import { Pagination } from '../Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class RecipeList extends Pagination(Recipe) {}
