import { Itinerary } from './Itinerary';
import { Pagination } from './../Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class ItineraryList extends Pagination(Itinerary) {}
