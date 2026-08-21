import { FIELD_VARIANT, LABEL_POSITION, type FormFieldConfig } from "@/components/common/form/types";

import { IBreakdownReviewSchema } from "./breakdown-review-schema";

type BreakdownReviewField = FormFieldConfig<IBreakdownReviewSchema>;

export const bcewVehicleTowedField: BreakdownReviewField = {
	name: "bcewVehicleTowed",
	fieldVariant: FIELD_VARIANT.TOGGLE,
	label: "BCEW Vehicle Towed",
	labelPosition: LABEL_POSITION.LEFT,
};

export const costOnSpotField: BreakdownReviewField = {
	name: "costOnSpot",
	fieldVariant: FIELD_VARIANT.CURRENCY_INPUT,
	label: "Cost (if paid on the spot)",
	placeholder: "$0.00",
};
