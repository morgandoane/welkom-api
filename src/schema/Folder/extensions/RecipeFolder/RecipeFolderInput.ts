import { FolderInput, UpdateFolderInput } from './../../FolderInput';
import { InputType } from 'type-graphql';

@InputType()
export class RecipeFolderInput extends FolderInput {}

@InputType()
export class UpdateRecipeFolderInput extends UpdateFolderInput {}
