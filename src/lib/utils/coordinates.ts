export const LAT_MIN = -90;
export const LAT_MAX = 90;
export const LNG_MIN = -180;
export const LNG_MAX = 180;

export interface ILatLng {
	lat: number;
	lng: number;
}

export const INVALID_LAT_LNG_MESSAGE = "Enter a valid latitude, longitude (e.g. 40.712800, -74.006000)";

const LAT_LNG_DECIMALS = 6;

const decimalCount = (token: string): number => {
	const dot = token.indexOf(".");
	return dot === -1 ? 0 : token.length - dot - 1;
};

const truncateDecimals = (token: string, max: number): string => {
	const dot = token.indexOf(".");
	if (dot === -1) return token;
	return token.slice(0, dot + 1 + max);
};

const sanitizeNumber = (raw: string): string => {
	const isNegative = raw.trim().startsWith("-");
	let body = raw.replace(/-/g, "");
	const dotIndex = body.indexOf(".");
	if (dotIndex !== -1) {
		body = body.slice(0, dotIndex + 1) + body.slice(dotIndex + 1).replace(/\./g, "");
	}
	return (isNegative ? "-" : "") + body;
};

const autoSplitLatitude = (input: string): string => {
	let latitude = "";
	let index = 0;
	for (; index < input.length; index++) {
		const char = input[index];
		if (char === "-") {
			if (latitude.length === 0) {
				latitude += char;
				continue;
			}
			break;
		}
		if (char === ".") {
			if (!latitude.includes(".")) {
				latitude += char;
				continue;
			}
			break;
		}
		if (decimalCount(latitude) >= LAT_LNG_DECIMALS) break;
		latitude += char;
	}
	const rest = input.slice(index).replace(/[^0-9.-]/g, "");
	if (rest.length === 0) {
		return decimalCount(latitude) >= LAT_LNG_DECIMALS ? `${latitude}, ` : latitude;
	}
	return `${latitude}, ${sanitizeNumber(rest)}`;
};

export const formatLatLngInput = (raw: string, isDeleting = false): string => {
	const cleaned = raw.replace(/[^0-9.,-]/g, "");
	const firstComma = cleaned.indexOf(",");
	if (firstComma === -1) {
		return isDeleting ? truncateDecimals(sanitizeNumber(cleaned), LAT_LNG_DECIMALS) : autoSplitLatitude(cleaned);
	}

	const latitude = truncateDecimals(sanitizeNumber(cleaned.slice(0, firstComma).replace(/,/g, "")), LAT_LNG_DECIMALS);
	const longitude = truncateDecimals(sanitizeNumber(cleaned.slice(firstComma + 1).replace(/,/g, "")), LAT_LNG_DECIMALS);
	if (isDeleting && longitude === "") return latitude;
	return `${latitude}, ${longitude}`;
};

export const parseLatLng = (value?: string | null): ILatLng | null => {
	if (!value) return null;
	const parts = value.split(",");
	if (parts.length !== 2) return null;

	const latPart = (parts[0] ?? "").trim();
	const lngPart = (parts[1] ?? "").trim();
	if (latPart === "" || lngPart === "") return null;

	const lat = Number(latPart);
	const lng = Number(lngPart);
	if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
	if (lat < LAT_MIN || lat > LAT_MAX) return null;
	if (lng < LNG_MIN || lng > LNG_MAX) return null;

	return { lat, lng };
};

export const isValidLatLng = (value?: string | null): boolean => parseLatLng(value) !== null;

export const formatLatLng = (lat: number, lng: number): string => `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
