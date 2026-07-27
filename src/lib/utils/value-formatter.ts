/**
 * @param str - The string to format.
 * @param capitalize - "first" or "all"
 * @default all
 * @returns string
 *
 * @description first: Capitalizes the first letter of whole string.
 *
 * all: Capitalizes first letter of each word in a string separated by underscores.
 *
 */

export enum CAPITALIZE_SNAKE_CASE {
	FIRST = "first",
	ALL = "all",
}

export function formatSnakeCase(
	str: string | undefined,
	capitalize: CAPITALIZE_SNAKE_CASE = CAPITALIZE_SNAKE_CASE.FIRST
) {
	if (!str) return "";

	const formattedStr = str
		.split("_")
		.map((word, idx) => {
			if (word.toLowerCase() === "and") {
				return "and"; // Keep "and" in lowercase
			}
			if (capitalize === CAPITALIZE_SNAKE_CASE.ALL) {
				return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
			}

			if (capitalize === CAPITALIZE_SNAKE_CASE.FIRST && idx === 0) {
				return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
			}

			return word.toLowerCase();
		})
		.join(" ");

	return formattedStr;
}

export function addSpacesToCamelCase(str: string, capitalize?: boolean) {
	const spacedStr = str.replace(/([a-z])([A-Z])/g, "$1 $2");
	if (capitalize) {
		// Capitalize the first letter and make the rest lowercase
		return spacedStr.charAt(0).toUpperCase() + spacedStr.slice(1).toLowerCase();
	}
	return spacedStr;
}

/**
 * Converts ENUM / SNAKE_CASE strings into human readable text
 *
 * Examples:
 * IN_PROGRESS -> In Progress
 * ON_HOLD -> On Hold
 * VALID_BUG -> Valid Bug
 */
export function formatEnumLabel(value?: string): string {
	if (!value) return "";

	return value
		.split("_")
		.map((word) => {
			const lower = word.toLowerCase();
			return lower.charAt(0).toUpperCase() + lower.slice(1);
		})
		.join(" ");
}

export function formatPascalCase(str: string | undefined): string {
	if (!str) return "";
	return str
		.toLowerCase()
		.replaceAll("_", " ")
		.replace(/\b\w/g, (char) => char.toUpperCase());
}

export const formatDisplayValue = (value: string | number | null | undefined) => {
	if (value === null || value === undefined || value === "") return "--";
	return value;
};
