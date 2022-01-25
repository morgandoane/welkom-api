import { Base } from '@src/schema/Base/Base';
import { modelOptions, prop } from '@typegoose/typegoose';

@modelOptions({
    schemaOptions: {
        collection: 'workbooks',
    },
})
export class Workbook extends Base {
    @prop({ required: true })
    date_created!: Date;
}
