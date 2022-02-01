import { Ingredient } from './Ingredient';
import { Pagination } from '../../../Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class IngredientList extends Pagination(Ingredient) {}
