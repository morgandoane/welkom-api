import { PaginateArg } from './../Pagination/Pagination';
import { LotModel } from './../Lot/Lot';
import { DocumentType, mongoose } from '@typegoose/typegoose';
import { FilterQuery } from 'mongoose';
import { Field, InputType } from 'type-graphql';
import { Tray, TrayModel } from './Tray';

@InputType()
export class TrayFilter extends PaginateArg {
    @Field({ nullable: true })
    location?: string;

    @Field({ nullable: true })
    lot?: string;

    @Field({ nullable: true })
    item?: string;

    public async serialize(): Promise<FilterQuery<DocumentType<Tray>>> {
        const res: FilterQuery<DocumentType<Tray>> = {};

        if (this.location) res.location = this.location;
        if (this.lot) res.lot = this.lot;

        if (!this.item) {
            return res;
        } else {
            const allTrays = await TrayModel.find({});

            const lotsInTrays = allTrays.map((t) => t.lots).flat();

            const lots = await LotModel.find({
                deleted: false,
                _id: {
                    $in: lotsInTrays.map(
                        (d) => new mongoose.Types.ObjectId(d.toString())
                    ),
                },
                item: this.item,
            });

            const validLotIds = lots.map((lot) => lot._id);

            return {
                ...res,
                lots: { $elemMatch: { $in: validLotIds } },
            } as FilterQuery<DocumentType<Tray>>;
        }
    }
}
