import { FIELD_VARIANT, LABEL_POSITION, type FormFieldConfig } from "@/components/common/form/types";
import type { IFormExampleSchema } from "./form-example-schema";

export const departmentOptions = [
	{ label: "Engineering", value: "engineering" },
	{ label: "Sales", value: "sales" },
	{ label: "Support", value: "support" },
	{ label: "Human Resources", value: "hr" },
];

export const skillOptions = [
	{ label: "React", value: "react" },
	{ label: "Node.js", value: "node" },
	{ label: "TypeScript", value: "typescript" },
	{ label: "Python", value: "python" },
	{ label: "Design", value: "design" },
];

export const countryOptions = [
	{ label: "United States", value: "us" },
	{ label: "United Kingdom", value: "uk" },
	{ label: "Canada", value: "ca" },
	{ label: "Australia", value: "au" },
	{ label: "India", value: "in" },
];

export const genderOptions = [
	{ label: "Male", value: "male" },
	{ label: "Female", value: "female" },
	{ label: "Other", value: "other" },
];

export const formExampleFields: FormFieldConfig<IFormExampleSchema>[] = [
	{
		name: "fullName",
		fieldVariant: FIELD_VARIANT.INPUT,
		label: "Full Name",
		placeholder: "Enter your full name",
	},
	{
		name: "email",
		fieldVariant: FIELD_VARIANT.INPUT,
		label: "Email",
		placeholder: "Enter your email",
		inputProps: { type: "email" },
	},
	{
		name: "password",
		fieldVariant: FIELD_VARIANT.INPUT,
		label: "Password",
		placeholder: "Enter your password",
		inputProps: { type: "password" },
	},
	{
		name: "bio",
		fieldVariant: FIELD_VARIANT.TEXTAREA,
		label: "Bio",
		placeholder: "Tell us a little about yourself",
		showCharCount: true,
		textareaProps: { maxLength: 200 },
	},
	{
		name: "department",
		fieldVariant: FIELD_VARIANT.SELECT,
		label: "Department",
		placeholder: "Select a department",
		options: departmentOptions,
	},
	{
		name: "skills",
		fieldVariant: FIELD_VARIANT.MULTI_SELECT,
		label: "Skills",
		placeholder: "Select your skills",
		options: skillOptions,
	},
	{
		name: "country",
		fieldVariant: FIELD_VARIANT.SEARCHABLE_SELECT,
		label: "Country",
		placeholder: "Select a country",
		options: countryOptions,
	},
	{
		name: "gender",
		fieldVariant: FIELD_VARIANT.RADIO_GROUP,
		label: "Gender",
		options: genderOptions,
	},
	{
		name: "joiningDate",
		fieldVariant: FIELD_VARIANT.DATE,
		label: "Joining Date",
	},
	{
		name: "salary",
		fieldVariant: FIELD_VARIANT.CURRENCY_INPUT,
		label: "Salary",
		placeholder: "0.00",
		currencySymbol: "$",
	},
	{
		name: "receiveNotifications",
		fieldVariant: FIELD_VARIANT.TOGGLE,
		label: "Receive Notifications",
		labelPosition: LABEL_POSITION.LEFT,
	},
	{
		name: "attachments",
		fieldVariant: FIELD_VARIANT.MULTI_IMAGE,
		label: "Attachments",
	},
];
