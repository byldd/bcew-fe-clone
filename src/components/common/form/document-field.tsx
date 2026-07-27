import type { FormMultiDocumentProps } from "@/components/common/form/types";
import DocumentUpload from "@/components/shared/document-upload/document-upload";
import type { FieldValues } from "react-hook-form";

export function FormMultiDocumentInput<TData extends FieldValues>({
	field,
	fieldConfig,
	disabled,
	canDelete,
}: FormMultiDocumentProps<TData>) {
	return (
		<DocumentUpload
			value={field.value || []}
			onChange={field.onChange}
			disabled={disabled || fieldConfig.disabled}
			canDelete={canDelete}
		/>
	);
}
