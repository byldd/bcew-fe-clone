import { FIELD_VARIANT, type FormFieldConfig, type IOptions } from "@/components/common/form/types";

import { IAccidentReviewSchema } from "./accident-review-schema";

type AccidentReviewField = FormFieldConfig<IAccidentReviewSchema>;

export const buildViolationTypeField = (options: IOptions[]): AccidentReviewField => ({
	name: "violationTypeId",
	fieldVariant: FIELD_VARIANT.SELECT,
	label: "Violation type*",
	placeholder: "Select",
	options,
});

export const overrideReasonField: AccidentReviewField = {
	name: "overrideReason",
	fieldVariant: FIELD_VARIANT.INPUT,
	label: "Override reason",
	placeholder: "If overriding",
};

export const repairEstimateField: AccidentReviewField = {
	name: "repairEstimate",
	fieldVariant: FIELD_VARIANT.MULTI_DOCUMENT,
	label: "Upload repair estimate",
	description: "Auto-categorizes severity",
};

export const insuranceCorrespondenceField: AccidentReviewField = {
	name: "insuranceCorrespondence",
	fieldVariant: FIELD_VARIANT.MULTI_DOCUMENT,
	label: "Upload insurance correspondence",
	description: "Letters, emails",
};
