import React from "react";
import { cn } from "@/lib/utils/utils";

interface FormLabelRequiredProps {
	label: string;
	required?: boolean;
	className?: string;
	htmlFor?: string;
}

export const FormLabelRequired: React.FC<FormLabelRequiredProps> = ({
	label,
	required = false,
	className,
	htmlFor,
}) => {
	return (
		<label htmlFor={htmlFor} className={cn("text-sm font-medium text-brand-grey", className)}>
			{label}
			{required && <span className="ml-0.5 align-super text-xs leading-none text-brand-grey">*</span>}
		</label>
	);
};
