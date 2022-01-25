import { Tray } from './Tray';
import { Pagination } from '@src/schema/Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class TrayList extends Pagination(Tray) {}
