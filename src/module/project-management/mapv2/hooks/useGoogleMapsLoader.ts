import { useJsApiLoader } from "@react-google-maps/api";
import { env } from "@/env.mjs";

// A shared `id` so every consumer in this module (the browse map and the create-zone draw
// control) resolves to the same underlying script load instead of each mounting its own
// <LoadScript>, which silently no-ops for the second mount once the first has already injected
// the script tag.
export const useGoogleMapsLoader = () => {
	return useJsApiLoader({
		id: "mapv2-google-maps-script",
		googleMapsApiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
	});
};
