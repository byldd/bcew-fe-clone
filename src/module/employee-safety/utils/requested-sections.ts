import { ACCIDENT_SECTION } from "../enums";

const VALID_SECTIONS = new Set<string>(Object.values(ACCIDENT_SECTION));

// The report stores requested sections as a JSON string; parse defensively into a
// set of known ACCIDENT_SECTION keys.
export const parseRequestedSections = (raw: string | null | undefined): Set<ACCIDENT_SECTION> => {
	if (!raw) return new Set();
	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return new Set();
		return new Set(parsed.filter((section): section is ACCIDENT_SECTION => VALID_SECTIONS.has(section)));
	} catch {
		return new Set();
	}
};
