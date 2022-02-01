import { QualityCheckClass } from '@src/schema/QualityCheck/QualityCheck';
import { QualityCheckLoader } from './../QualityCheck/QualityCheck';
import { Ref } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { QualityCheck } from '../QualityCheck/QualityCheck';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { QualityCheckResponse } from './QualityCheckResponse';
import { getId } from '@src/utils/getId';
import { UserInputError } from 'apollo-server-core';
import { isValid } from 'date-fns';

@InputType()
export class QualityCheckResponseInput {
    @Field(() => ObjectIdScalar)
    quality_check!: Ref<QualityCheck>;

    @Field({ nullable: true })
    response!: string | null;

    public async validate(): Promise<QualityCheckResponse> {
        const check = await QualityCheckLoader.load(this.quality_check, true);

        if ((this.response == null || this.response == '') && check.required)
            throw new UserInputError('Quality check is required.');

        switch (check.quality_check_class) {
            case QualityCheckClass.Boolean: {
                if (
                    this.response !== null &&
                    !['true', 'false'].includes(this.response)
                )
                    throw new UserInputError('Invalid boolean response.');

                const res: QualityCheckResponse = {
                    ...getId(),
                    quality_check: check._id,
                    passed: this.response == 'true' ? true : false,
                    response: this.response,
                };
            }
            case QualityCheckClass.Date: {
                if (this.response !== null && !isValid(this.response))
                    throw new UserInputError('Invalid date response.');

                const res: QualityCheckResponse = {
                    ...getId(),
                    quality_check: check._id,
                    passed: true,
                    response: this.response,
                };

                return res;
            }
            case QualityCheckClass.Number: {
                let val = null;
                if (this.response !== null && this.response == '') {
                    const parsed = parseFloat(this.response);
                    if (isNaN(parsed))
                        throw new UserInputError('Invalid number input');

                    val = parsed.toString();
                }
                const res: QualityCheckResponse = {
                    ...getId(),
                    quality_check: check._id,
                    passed:
                        val !== null && check.number_range
                            ? parseFloat(val) <= check.number_range.max &&
                              parseFloat(val) >= check.number_range.min
                            : true,
                    response: val,
                };

                return res;
            }

            case QualityCheckClass.Options: {
                let val = null;
                if (this.response !== null && this.response == '') {
                    val = this.response;
                }
                const res: QualityCheckResponse = {
                    ...getId(),
                    quality_check: check._id,
                    passed:
                        val !== null && check.options
                            ? check.options
                                  .filter((o) => o.acceptable)
                                  .map((a) => a.value)
                                  .includes(val)
                            : true,
                    response: val,
                };

                return res;
            }

            case QualityCheckClass.Text: {
                let val = null;
                if (this.response !== null && this.response == '') {
                    val = this.response;
                }
                const res: QualityCheckResponse = {
                    ...getId(),
                    quality_check: check._id,
                    passed: true,
                    response: val,
                };

                return res;
            }
        }
    }
}
