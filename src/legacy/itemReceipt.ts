import { QualityCheckModel } from './../schema/QualityCheck/QualityCheck';
import {
    Verification,
    VerificationModel,
    VerificationStatus,
} from './../schema/Verification/Verification';
import { ProfileModel } from './../schema/Profile/Profile';
import { BolModel } from './../schema/Bol/Bol';
import {
    CodeGenerator,
    CodeType,
} from './../services/CodeGeneration/CodeGeneration';
import { UnitLoader, UnitModel } from './../schema/Unit/Unit';
import {
    Company,
    CompanyLoader,
    CompanyModel,
} from './../schema/Company/Company';
import { LegacySupplierModel } from './supplier';
import { Context } from '@src/auth/context';
import { Item, ItemLoader, ItemModel } from './../schema/Item/Item';
import { ObjectId } from 'mongoose';
import { LocationLoader, LocationModel } from './../schema/Location/Location';
import { LegacyLot, LegacyLotModel } from './itemLot';
import { LegacyUser, LegacyUserModel, LegacyUserLoader } from './user';
import { env } from '@src/config';
import { createConnection } from './legacyConnection';
import {
    modelOptions,
    prop,
    getModelForClass,
    Ref,
    DocumentType,
    mongoose,
} from '@typegoose/typegoose';
import { LegacyItemOrder, LegacyItemOrderModel } from './itemOrder';
import { LegacyPlant, LegacyPlantModel, LegacyPlantLoader } from './plant';
import { LegacyUnit, LegacyUnitModel, LegacyUnitLoader } from './unit';
import {
    LegacyQualityCheckResponse,
    LegacyQualityCheckResponseModel,
} from './qualtiyCheckResponse';
import {
    FulfillmentInput,
    FulfillmentItemInput,
} from '@src/schema/Fulfillment/FulfillmentInput';
import {
    Fulfillment,
    FulfillmentType,
} from '@src/schema/Fulfillment/Fulfillment';
import { LegacyItemModel, LegacyItemLoader } from './item';
import { Lot, LotModel } from '@src/schema/Lot/Lot';
import { loaderResult } from '@src/utils/loaderResult';
import { Bol, BolStatus } from '@src/schema/Bol/Bol';
import { Itinerary, ItineraryModel } from '@src/schema/Itinerary/Itinerary';
import { Order } from '@src/schema/Order/Order';
import { UserInputError } from 'apollo-server-errors';
import {
    AppMetaData,
    UserMetaData,
    Profile,
} from '@src/schema/Profile/Profile';
import {
    AuthProvider,
    assignUserRole,
} from '@src/services/AuthProvider/AuthProvider';
import { UserData, CreateUserData, User } from 'auth0';
import { UserRole } from '@src/auth/UserRole';
import {
    QualityCheckResponseInput,
    validateResponse,
} from '@src/schema/QualityCheckResponse/QualityCheckResponseInput';
import { CreateProfileInput } from '@src/schema/Profile/ProfileInput';
import { QualityCheckResponse } from '@src/schema/QualityCheckResponse/QualityCheckResponse';

const connection = createConnection(env.LEGACY_ATLAS_URL);

@modelOptions({
    schemaOptions: {
        collection: 'itemreceipts',
    },
    existingConnection: connection,
})
export class LegacyItemReceipt {
    @prop({ required: true, ref: 'LegacyItemOrder' })
    itemOrder: Ref<LegacyItemOrder>;

    @prop({ required: true, ref: () => LegacyUser })
    receivedBy: Ref<LegacyUser>;

    @prop({ required: true, ref: () => LegacyPlant })
    plant: Ref<LegacyPlant>;

    @prop({ required: true })
    receivedQuantity: number;

    @prop({ required: true, ref: () => LegacyUnit })
    unitContainer: Ref<LegacyUnit>;

    @prop({ required: true })
    bol: string;

    @prop({ required: true })
    seal: string;

    @prop({ required: true })
    dateReceived: Date;

    @prop({ enum: ['accept', 'hold', 'reject'], required: true })
    shipmentStatus: string;

    @prop({ required: true })
    failedQcs: boolean;

    @prop({ required: true })
    failedGen: boolean;

    @prop({ required: true, ref: () => LegacyQualityCheckResponse })
    shipmentQualityChecks: Ref<LegacyQualityCheckResponse>[];

    @prop({ required: true })
    shipmentReason: string;

    @prop({ required: true })
    notes: string;

    @prop({ required: true, ref: 'LegacyLot' })
    lotBreakdown: Ref<LegacyLot>[];

    @prop({ required: true })
    verified: boolean;

    @prop({ required: true, ref: () => LegacyUser })
    verifiedBy: Ref<LegacyUser>;

    @prop({ required: true })
    verifiedDate: Date;

    public async convert(
        newOrder: DocumentType<Order>,
        context: Context
    ): Promise<FulfillmentInput> {
        const { base } = context;
        const items: FulfillmentItemInput[] = [];

        const legacyLocation = await LegacyPlantModel.findById(
            this.plant.toString()
        );

        const legacyReceiptUser = await LegacyUserModel.findById(
            this.receivedBy.toString()
        );

        const received_by = await upsertUser(
            context,
            await legacyReceiptUser.convert('Wasatch1!')
        );

        const { _id, ...rest } = base;

        const location = await LocationModel.findOneAndUpdate(
            {
                label: legacyLocation.name,
            },
            {
                ...rest,
                ...(await legacyLocation.convert(
                    new mongoose.Types.ObjectId('61dabad64b8beb4274a3f292')
                )),
            },
            { new: true, upsert: true }
        );

        const itinerary: Itinerary = {
            ...rest,
            _id: new mongoose.Types.ObjectId(),
            created_by: newOrder.created_by,
            modified_by: newOrder.modified_by,
            date_created: newOrder.date_created,
            date_modified: newOrder.date_created,
            code: await CodeGenerator.generate(CodeType.ITIN),
            orders: [newOrder._id],
        };

        const bol: Bol = {
            ...rest,
            code: newOrder.code,
            _id: new mongoose.Types.ObjectId(),
            created_by: newOrder.created_by,
            modified_by: newOrder.modified_by,
            date_created: newOrder.date_created,
            date_modified: newOrder.date_created,
            itinerary: itinerary._id,
            status: BolStatus.Pending,
            from: {
                _id: new mongoose.Types.ObjectId(),
                company: newOrder.vendor,
                date: this.dateReceived,
            },
            to: {
                _id: new mongoose.Types.ObjectId(),
                company: newOrder.customer,
                location: location._id,
                date: this.dateReceived,
            },
            contents: [
                ...newOrder.contents.map((content) => ({
                    item: content.item,
                    quantity: content.quantity,
                    unit: content.unit,
                    fulfillment_percentage: 0,
                })),
            ],
        };

        await ItineraryModel.create(itinerary);
        await BolModel.create(bol);

        for (const legacyLot of this.lotBreakdown) {
            const legacyOrder = await LegacyItemOrderModel.findOne({
                _id: this.itemOrder,
            });
            const legacyLotDoc = await LegacyLotModel.findById(legacyLot);
            const legacyItem = await LegacyItemModel.findById(
                legacyOrder.item.toString()
            );
            const legacyUnit = await LegacyUnitModel.findById(
                legacyLotDoc.unitContainer.toString()
            );

            const itemInput = await legacyItem.convert();

            const itemDoc = await ItemModel.findOneAndUpdate(
                { english: legacyItem.englishName },
                { ...rest, ...itemInput },
                { new: true, upsert: true }
            );

            const unitInput = await legacyUnit.convert();

            const unitDoc = await UnitModel.findOneAndUpdate(
                { english: unitInput.english },
                { ...rest, ...unitInput },
                { new: true, upsert: true }
            );

            const legacyQualityResponses =
                await LegacyQualityCheckResponseModel.find({
                    _id: { $in: legacyLotDoc.lotQualityChecks },
                });

            const quality_check_responses: QualityCheckResponseInput[] = [];

            for (const legacyResponse of legacyQualityResponses) {
                const itemWithCheck = await LegacyItemModel.findOne({
                    ['qualityChecks._id']:
                        legacyResponse.qualityCheckDefinition.toString(),
                });
                const legacyCheck = itemWithCheck.qualityChecks.find(
                    (check) =>
                        check._id.toString() ===
                        legacyResponse.qualityCheckDefinition.toString()
                );

                const converted = await legacyCheck.convert(
                    context,
                    itemDoc._id
                );

                if (converted) {
                    const qualityCheck =
                        await QualityCheckModel.findOneAndUpdate(
                            {
                                item: itemDoc._id,
                                ['prompt.phrase']: legacyResponse.question,
                            },
                            { ...rest, ...converted },
                            { upsert: true, new: true }
                        );

                    quality_check_responses.push({
                        qualityCheck:
                            qualityCheck._id.toString() as unknown as ObjectId,
                        response: legacyResponse.response,
                        validateResponse: async ({
                            base,
                        }: Context): Promise<QualityCheckResponse> => {
                            const res: QualityCheckResponse = {
                                ...rest,
                                qualityCheck: qualityCheck._id,
                                response: legacyResponse.response,
                                passed: legacyResponse.passed,
                            };

                            return res;
                        },
                    });
                }
            }

            items.push({
                item: itemDoc._id.toString() as unknown as ObjectId,
                lots: [
                    {
                        code: legacyLotDoc.lot,
                        company:
                            newOrder.vendor.toString() as unknown as ObjectId,
                        quantity: legacyLotDoc.quantity,
                        unit: unitDoc._id.toString(),
                        execute: async (
                            context: Context,
                            item_id: Ref<Item> | string
                        ): Promise<DocumentType<Lot>> => {
                            const company = loaderResult(
                                await CompanyModel.findById(
                                    newOrder.vendor.toString()
                                )
                            );

                            const match = await LotModel.findOne({
                                item: itemDoc._id.toString(),
                                company: company._id,
                                code: legacyLotDoc.lot,
                            });

                            if (match) return match;
                            else {
                                const newLot: Lot = {
                                    ...rest,
                                    _id: new mongoose.Types.ObjectId(),
                                    quality_check_responses: [],
                                    code: legacyLotDoc.lot,
                                    item: itemDoc._id,
                                    company: company._id,
                                    contents: [],
                                    start_quantity: 0,
                                };

                                const res = await LotModel.create(newLot);

                                return res;
                            }
                        },
                    },
                ],
                quality_check_responses,
            });
        }

        return {
            bol: bol._id.toString() as unknown as ObjectId,
            items,
            type: FulfillmentType.Receipt,
            location: location._id.toString() as unknown as ObjectId,
            company: location.company.toString() as unknown as ObjectId,
            validateFulfillment: async (
                context: Context
            ): Promise<Fulfillment> => {
                loaderResult(
                    await LocationModel.findById(location._id.toString())
                );

                let verification: DocumentType<Verification> | null = null;

                if (this.verified && this.verifiedBy && this.verifiedDate) {
                    const legacyVerifiedBy = await LegacyUserModel.findById(
                        this.verifiedBy.toString()
                    );

                    const verified_by = await upsertUser(
                        context,
                        await legacyVerifiedBy.convert('Wasatch1!')
                    );

                    const doc: Verification = {
                        _id: new mongoose.Types.ObjectId(),
                        status: VerificationStatus.Verified,
                        date_created: this.verifiedDate,
                        created_by: verified_by.user_id,
                        deleted: false,
                    };
                    verification = await VerificationModel.create(doc);
                }

                const fulfillment: Fulfillment = {
                    ...rest,
                    _id: new mongoose.Types.ObjectId(),
                    created_by: received_by.user_id,
                    modified_by: received_by.user_id,
                    date_created: this.dateReceived,
                    date_modified: this.dateReceived,
                    bol: bol._id,
                    type: FulfillmentType.Receipt,
                    location: location._id,
                    company: newOrder.customer,
                    lots: [],
                    verification: verification ? verification._id : undefined,
                };

                for (const {
                    item: item_id,
                    lots,
                    quality_check_responses,
                } of items) {
                    const item = await loaderResult(
                        ItemModel.findById(item_id.toString())
                    );

                    let start_quantity = 0;

                    const qtys = lots.map(({ quantity, unit }) => ({
                        quantity,
                        unit,
                    }));

                    for (const { quantity, unit: unit_id } of qtys) {
                        // We need to understand this unit in the UnitClass of the lot's item
                        const unit = loaderResult(
                            await UnitModel.findById(unit_id.toString())
                        );

                        if (unit.class === item.unit_class) {
                            // no conversion necessary
                            start_quantity += quantity * unit.base_per_unit;
                        } else {
                            // conversion is necessary
                            const conversion = item.conversions.find(
                                ({ from, to }) =>
                                    from === item.unit_class &&
                                    to === unit.class
                            );

                            if (!conversion) {
                                throw new UserInputError(
                                    `Failed to interperet conversion from ${
                                        item.unit_class
                                    } to ${
                                        unit.class
                                    } for item with id ${item._id.toString()}`
                                );
                            } else {
                                start_quantity +=
                                    quantity *
                                    conversion.from_per_to *
                                    unit.base_per_unit;
                            }
                        }
                    }

                    const fulfillmentLot: Lot = {
                        ...rest,
                        _id: new mongoose.Types.ObjectId(),
                        created_by: received_by.user_id,
                        modified_by: received_by.user_id,
                        date_created: this.dateReceived,
                        date_modified: this.dateReceived,
                        code: await CodeGenerator.generate(CodeType.LOT),
                        quality_check_responses: [],
                        contents: [],
                        start_quantity,
                        item: item._id,
                    };

                    for (const lotfinder of lots) {
                        const lot = await lotfinder.execute(context, item._id);
                        const unit = loaderResult(
                            await UnitModel.findById(lotfinder.unit)
                        );
                        fulfillmentLot.contents.push({
                            lot: lot._id,
                            quantity: lotfinder.quantity,
                            unit: unit._id,
                        });
                    }

                    for (const check of quality_check_responses) {
                        fulfillmentLot.quality_check_responses.push(
                            await check.validateResponse(context)
                        );
                    }

                    const fulfillmentLotRes = await LotModel.create(
                        fulfillmentLot
                    );

                    fulfillment.lots.push(fulfillmentLotRes._id);
                }

                return fulfillment;
            },
        };
    }
}

export const LegacyItemReceiptModel = getModelForClass(LegacyItemReceipt);

export const upsertUser = async (
    context: Context,
    { email, given_name, family_name }: CreateProfileInput
): Promise<DocumentType<Profile>> => {
    const match = await ProfileModel.findOne({
        given_name,
        family_name,
    });

    if (match) return match;
    else {
        const userData: UserData<AppMetaData, UserMetaData> = {
            email: `${given_name}_${family_name}@gmail.com`,
            email_verified: false,
            verify_email: true,
            blocked: false,
            password: 'Wasatch1!',
            given_name,
            family_name,
            user_metadata: {
                prefers_dark_mode: true,
                phone_number: '',
            },
            app_metadata: {
                created_by: context.base.created_by,
                require_password_reset: true,
            },
        };

        const createUserData: CreateUserData = {
            connection: 'WELKOM',
            ...userData,
        };

        const auth0res = (await AuthProvider.createUser(createUserData).catch(
            (e) => {
                throw new UserInputError(e);
            }
        )) as User<AppMetaData, UserMetaData>;

        const profile: Profile = {
            _id: new mongoose.Types.ObjectId().toString(),
            ...auth0res,
            email: auth0res.email || '',
            family_name: auth0res.family_name || '',
            given_name: auth0res.given_name || '',
            name: auth0res.name || '',
            roles: [UserRole.User],
            app_metadata: auth0res.app_metadata as AppMetaData,
        };

        await assignUserRole(context, auth0res.user_id || '', UserRole.User);

        const res = await ProfileModel.create(profile);

        return res;
    }
};
