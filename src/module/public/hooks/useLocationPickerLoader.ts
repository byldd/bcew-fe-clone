import { useJsApiLoader, type Libraries } from "@react-google-maps/api";
import { env } from "@/env.mjs";

// `places` is needed for the search-box Autocomplete. Kept as a module-level const so the
// reference is stable across renders (a new array each render makes the loader warn/reload).
const libraries: Libraries = ["places"];

export const useLocationPickerLoader = () => {
	return useJsApiLoader({
		id: "location-picker-google-maps-script",
		googleMapsApiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
		libraries,
	});
};
