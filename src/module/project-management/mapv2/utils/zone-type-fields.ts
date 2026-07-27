import { FIELD_VARIANT, type FormFieldConfig, type IOptions } from "@/components/common/form/types";
import type { IZoneTypeFormSchema } from "./zone-type-schema";

export const buildZoneTypeFields = (
	tabOptions: IOptions[],
	disabled = false
): FormFieldConfig<IZoneTypeFormSchema>[] => [
	{
		name: "name",
		fieldVariant: FIELD_VARIANT.INPUT,
		label: "Zone Type Name",
		placeholder: "Enter zone type name",
		disabled,
	},
];
