import { FIELD_VARIANT, type FormFieldConfig, type IOptions } from "@/components/common/form/types";
import type { IMapZoneFormSchema } from "./zone-schema";

export const buildZoneNameAndTypeFields = (zoneTypeOptions: IOptions[]): FormFieldConfig<IMapZoneFormSchema>[] => [
	{
		name: "name",
		fieldVariant: FIELD_VARIANT.INPUT,
		label: "Zone Name",
		placeholder: "Enter zone name",
	},
	{
		name: "mapZoneTypeId",
		fieldVariant: FIELD_VARIANT.SELECT,
		label: "Zone Type",
		placeholder: "Select a zone type",
		options: zoneTypeOptions,
	},
];

export const buildAddressFields = (): FormFieldConfig<IMapZoneFormSchema>[] => [
	{ name: "address", fieldVariant: FIELD_VARIANT.INPUT, label: "Address", placeholder: "Street address" },
	{ name: "city", fieldVariant: FIELD_VARIANT.INPUT, label: "City", placeholder: "City" },
	{ name: "state", fieldVariant: FIELD_VARIANT.INPUT, label: "State", placeholder: "State" },
	{ name: "zipcode", fieldVariant: FIELD_VARIANT.INPUT, label: "Zipcode", placeholder: "Zipcode" },
	{ name: "country", fieldVariant: FIELD_VARIANT.INPUT, label: "Country", placeholder: "Country" },
];

export const buildEmployeePickerField = (
	options: IOptions[],
	onSearch: (value: string) => void
): FormFieldConfig<IMapZoneFormSchema>[] => [
	{
		name: "empNum",
		fieldVariant: FIELD_VARIANT.SEARCHABLE_SELECT,
		label: "Employee",
		placeholder: "Search employee by name",
		options,
		onSearch,
	},
];

export const buildProjectPickerField = (
	options: IOptions[],
	onSearch: (value: string) => void
): FormFieldConfig<IMapZoneFormSchema>[] => [
	{
		name: "projectRecnum",
		fieldVariant: FIELD_VARIANT.SEARCHABLE_SELECT,
		label: "Project",
		placeholder: "Search project by name",
		options,
		onSearch,
	},
];
