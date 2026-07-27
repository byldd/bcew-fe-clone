import { FieldErrors, FieldValues } from "react-hook-form";

const firstErrorPath = (errors: FieldErrors, prefix = ""): string | null => {
	for (const key of Object.keys(errors)) {
		const value = errors[key];
		if (!value) continue;

		const path = prefix ? `${prefix}.${key}` : key;
		if ("message" in value && value.message) return path;

		const nested = firstErrorPath(value as FieldErrors, path);
		if (nested) return nested;
	}
	return null;
};

export const focusFirstError = <TData extends FieldValues>(errors: FieldErrors<TData>): void => {
	const path = firstErrorPath(errors);
	if (!path) return;

	const element = document.getElementById(path);
	const target = element ?? document.querySelector(`[data-error-anchor="${path}"]`);
	target?.scrollIntoView({ behavior: "smooth", block: "center" });
	if (element instanceof HTMLElement) element.focus({ preventScroll: true });
};
