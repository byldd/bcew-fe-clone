import { FIELD_VARIANT, type FormFieldConfig, type IOptions } from "@/components/common/form/types";

import { IAccidentReviewSchema } from "./accident-review-schema";

type AccidentReviewField = FormFieldConfig<IAccidentReviewSchema>;

export const buildViolationTypeField = (options: IOptions[]): AccidentReviewField => ({
	name: "violationTypeId",
	fieldVariant: FIELD_VARIANT.SELECT,
	label: "Violation Type*",
	placeholder: "Select",
	options,
});

export const overrideReasonField: AccidentReviewField = {
	name: "overrideReason",
	fieldVariant: FIELD_VARIANT.INPUT,
	label: "Override Reason",
	placeholder: "If overriding",
};

export const insuranceCorrespondenceField: AccidentReviewField = {
	name: "insuranceCorrespondence",
	fieldVariant: FIELD_VARIANT.MULTI_DOCUMENT,
	label: "Upload Insurance Correspondence",
	description: "Letters, emails",
};
