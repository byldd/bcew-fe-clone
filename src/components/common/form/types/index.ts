import { type ComponentPropsWithoutRef } from "react";
import type { ControllerRenderProps, FieldValues, Path, UseFormReturn } from "react-hook-form";

export enum FIELD_VARIANT {
	INPUT = "input",
	TEXTAREA = "textarea",
	SELECT = "select",
	MULTI_SELECT = "multi-select",
	SEARCHABLE_SELECT = "searchable-select",
	RADIO_GROUP = "radio-group",
	CURRENCY_INPUT = "currency-input",
	DATE = "date",
	TOGGLE = "toggle",
	IMAGE = "image",
	MULTI_IMAGE = "multi-image",
	MULTI_DOCUMENT = "multi-document",
}

export enum LABEL_POSITION {
	TOP = "top",
	LEFT = "left",
	RIGHT = "right",
}

export interface IOptions {
	value: string;
	label: string;
	disabled?: boolean;
	labelJsx?: React.ReactNode;
}

// Base field configuration
export interface BaseFieldConfig {
	label?: string;
	description?: string;
	/** Red helper note rendered below the control (e.g. a policy reminder). */
	note?: string;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	/** Position of the label relative to the field control. Defaults to "top". */
	labelPosition?: LABEL_POSITION;
}

// Input field variant with all Input props
export interface InputFieldConfig extends BaseFieldConfig {
	fieldVariant: FIELD_VARIANT.INPUT;
	inputProps?: Omit<ComponentPropsWithoutRef<"input">, "disabled" | "className" | "placeholder">;
}

// Textarea field variant with all Textarea props
export interface TextareaFieldConfig extends BaseFieldConfig {
	fieldVariant: FIELD_VARIANT.TEXTAREA;
	showCharCount?: boolean;
	textareaProps?: Omit<ComponentPropsWithoutRef<"textarea">, "disabled" | "className" | "placeholder">;
}

// Select field variant
export interface SelectFieldConfig extends BaseFieldConfig {
	fieldVariant: FIELD_VARIANT.SELECT;
	options: IOptions[];
	placeholder?: string;
}

// Multi-select field variant
export interface MultiSelectFieldConfig extends BaseFieldConfig {
	fieldVariant: FIELD_VARIANT.MULTI_SELECT;
	options: IOptions[];
	placeholder?: string;
	onSearch?: (value: string) => void;
}

export interface RadioGroupFieldConfig extends BaseFieldConfig {
	fieldVariant: FIELD_VARIANT.RADIO_GROUP;
	options: IOptions[];
}

// Searchable select field variant
export interface SearchableSelectFieldConfig extends BaseFieldConfig {
	fieldVariant: FIELD_VARIANT.SEARCHABLE_SELECT;
	options: IOptions[];
	placeholder?: string;
	onSearch?: (value: string) => void;
}

// Currency input field variant
export interface CurrencyInputFieldConfig extends BaseFieldConfig {
	fieldVariant: FIELD_VARIANT.CURRENCY_INPUT;
	inputProps?: Omit<ComponentPropsWithoutRef<"input">, "type" | "disabled" | "className" | "placeholder">;
	currencySymbol?: string;
}

export interface DateInputFieldConfig extends BaseFieldConfig {
	fieldVariant: FIELD_VARIANT.DATE;
	inputProps?: Omit<ComponentPropsWithoutRef<"input">, "type" | "disabled" | "className" | "placeholder">;
}

// Toggle (switch) field variant
export interface ToggleFieldConfig extends BaseFieldConfig {
	fieldVariant: FIELD_VARIANT.TOGGLE;
}

// single-image upload field variant
export interface ImageFieldConfig extends BaseFieldConfig {
	fieldVariant: FIELD_VARIANT.IMAGE;
}
// Multi-image upload field variant
export interface MultiImageFieldConfig extends BaseFieldConfig {
	fieldVariant: FIELD_VARIANT.MULTI_IMAGE;
}

export interface MultiDocumentFieldConfig extends BaseFieldConfig {
	fieldVariant: FIELD_VARIANT.MULTI_DOCUMENT;
}

// Union type for all field configurations
export type FormFieldConfig<TData extends FieldValues> = (
	| InputFieldConfig
	| TextareaFieldConfig
	| SelectFieldConfig
	| MultiSelectFieldConfig
	| SearchableSelectFieldConfig
	| CurrencyInputFieldConfig
	| RadioGroupFieldConfig
	| DateInputFieldConfig
	| ToggleFieldConfig
	| ImageFieldConfig
	| MultiImageFieldConfig
	| MultiDocumentFieldConfig
) & {
	name: Path<TData>;
};

export interface RenderFormInputProps<TData extends FieldValues> {
	field: ControllerRenderProps<TData, Path<TData>>;
	fieldConfig: FormFieldConfig<TData>;
	className?: string;
	disabled?: boolean;
	canDelete?: boolean;
}

export interface FormInputWrapperProps<TData extends FieldValues> {
	form: UseFormReturn<TData>;
	fieldConfig: FormFieldConfig<TData>;
	className?: string;
	wrapperClassName?: string;
	disabled?: boolean;
	canDelete?: boolean;
}

export type VariantFieldConfig<
	TData extends FieldValues,
	TVariant extends FormFieldConfig<TData>["fieldVariant"],
> = Extract<FormFieldConfig<TData>, { fieldVariant: TVariant }>;

export interface FormTextAreaProps<TData extends FieldValues> {
	field: ControllerRenderProps<TData, Path<TData>>;
	fieldConfig: VariantFieldConfig<TData, FIELD_VARIANT.TEXTAREA>;
	className?: string;
	disabled?: boolean;
}

export interface FormInputProps<TData extends FieldValues> {
	field: ControllerRenderProps<TData, Path<TData>>;
	fieldConfig: VariantFieldConfig<TData, FIELD_VARIANT.INPUT>;
	className?: string;
	disabled?: boolean;
}

export interface FormRadioGroupProps<TData extends FieldValues> {
	field: ControllerRenderProps<TData, Path<TData>>;
	fieldConfig: VariantFieldConfig<TData, FIELD_VARIANT.RADIO_GROUP>;
	className?: string;
	disabled?: boolean;
}

export interface FormDateInputProps<TData extends FieldValues> {
	field: ControllerRenderProps<TData, Path<TData>>;
	fieldConfig: VariantFieldConfig<TData, FIELD_VARIANT.DATE>;
	className?: string;
	disabled?: boolean;
}

export interface FormToggleProps<TData extends FieldValues> {
	field: ControllerRenderProps<TData, Path<TData>>;
	fieldConfig: VariantFieldConfig<TData, FIELD_VARIANT.TOGGLE>;
	className?: string;
	disabled?: boolean;
}

export interface FormImageProps<TData extends FieldValues> {
	field: ControllerRenderProps<TData, Path<TData>>;
	fieldConfig: VariantFieldConfig<TData, FIELD_VARIANT.IMAGE>;
	className?: string;
	disabled?: boolean;
}

export interface FormMultiImageProps<TData extends FieldValues> {
	field: ControllerRenderProps<TData, Path<TData>>;
	fieldConfig: VariantFieldConfig<TData, FIELD_VARIANT.MULTI_IMAGE>;
	className?: string;
	disabled?: boolean;
	canDelete?: boolean;
}

export interface FormMultiDocumentProps<TData extends FieldValues> {
	field: ControllerRenderProps<TData, Path<TData>>;
	fieldConfig: VariantFieldConfig<TData, FIELD_VARIANT.MULTI_DOCUMENT>;
	className?: string;
	disabled?: boolean;
	canDelete?: boolean;
}
