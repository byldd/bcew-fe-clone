import type { FormMultiImageProps } from "@/components/common/form/types";
import ImageUpload from "@/components/shared/image-upload/image-upload";
import type { FieldValues } from "react-hook-form";

export function FormMultiImageInput<TData extends FieldValues>({
	field,
	fieldConfig,
	disabled,
	canDelete,
}: FormMultiImageProps<TData>) {
	return (
		<ImageUpload
			value={field.value || []}
			onChange={field.onChange}
			disabled={disabled || fieldConfig.disabled}
			canDelete={canDelete}
		/>
	);
}
