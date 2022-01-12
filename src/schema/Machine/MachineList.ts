import { Machine } from './Machine';
import { Pagination } from '@src/schema/Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class MachineList extends Pagination(Machine) {}
