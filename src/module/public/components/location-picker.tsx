"use client";

import { useCallback, useRef, useState } from "react";
import { GoogleMap, MarkerF, Autocomplete } from "@react-google-maps/api";
import { Copy, Crosshair, ExternalLink, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useLocationPickerLoader } from "../hooks/useLocationPickerLoader";

export type SelectedLocation = {
	lat: number;
	lng: number;
	address: string;
	googleMapsLink: string;
};

// Philadelphia — matches the app's default map center (see mapv2 zone-map).
const defaultCenter = { lat: 39.9526, lng: -75.1652 };

const mapContainerStyle = { width: "100%", height: "100%" };

const buildGoogleMapsLink = (lat: number, lng: number) =>
	`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

const LocationPicker = () => {
	const { isLoaded } = useLocationPickerLoader();
	const mapRef = useRef<google.maps.Map | null>(null);
	const geocoderRef = useRef<google.maps.Geocoder | null>(null);
	const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

	const [selected, setSelected] = useState<SelectedLocation | null>(null);
	const [isLocating, setIsLocating] = useState(false);

	const getGeocoder = () => {
		if (!geocoderRef.current) geocoderRef.current = new google.maps.Geocoder();
		return geocoderRef.current;
	};

	// Drop/move the pin, reverse-geocode to a human-readable address, and build the shareable link.
	const setLocation = useCallback((lat: number, lng: number, panTo = true) => {
		if (panTo && mapRef.current) {
			mapRef.current.panTo({ lat, lng });
			mapRef.current.setZoom(16);
		}

		setSelected({ lat, lng, address: "", googleMapsLink: buildGoogleMapsLink(lat, lng) });

		getGeocoder().geocode({ location: { lat, lng } }, (results, status) => {
			if (status === "OK" && results?.[0]) {
				const address = results[0].formatted_address;
				setSelected((prev) => (prev && prev.lat === lat && prev.lng === lng ? { ...prev, address } : prev));
			}
		});
	}, []);

	const handleMapClick = useCallback(
		(e: google.maps.MapMouseEvent) => {
			if (!e.latLng) return;
			setLocation(e.latLng.lat(), e.latLng.lng(), false);
		},
		[setLocation]
	);

	const handleUseCurrentLocation = useCallback(() => {
		if (!navigator.geolocation) {
			openErrorToast({ message: "Geolocation is not supported by this browser." });
			return;
		}

		setIsLocating(true);
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				setLocation(pos.coords.latitude, pos.coords.longitude);
				setIsLocating(false);
			},
			() => {
				openErrorToast({ message: "Unable to get your current location. Please allow location access." });
				setIsLocating(false);
			},
			{ enableHighAccuracy: true, timeout: 10000 }
		);
	}, [setLocation]);

	const handlePlaceChanged = useCallback(() => {
		const place = autocompleteRef.current?.getPlace();
		const loc = place?.geometry?.location;
		if (!loc) return;
		setLocation(loc.lat(), loc.lng());
	}, [setLocation]);

	const handleCopyLink = useCallback(async () => {
		if (!selected) return;
		try {
			await navigator.clipboard.writeText(selected.googleMapsLink);
			openSuccessToast("Google Maps link copied");
		} catch {
			openErrorToast({ message: "Failed to copy link" });
		}
	}, [selected]);

	if (!isLoaded) {
		return (
			<div className="flex h-[480px] w-full items-center justify-center rounded-2xl bg-brand-bgLightgrey">
				<Spinner />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row">
				<Autocomplete
					className="flex-1"
					onLoad={(a) => (autocompleteRef.current = a)}
					onPlaceChanged={handlePlaceChanged}
				>
					<div className="relative">
						<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
						<input
							type="text"
							placeholder="Search for the incident location"
							className="h-11 w-full rounded-[10px] border-none bg-brand-bgLightgrey pl-10 pr-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-grey"
						/>
					</div>
				</Autocomplete>

				<Button
					type="button"
					onClick={handleUseCurrentLocation}
					disabled={isLocating}
					className="h-11 shrink-0 gap-2 rounded-[10px] bg-brand-dark text-sm font-semibold text-white hover:bg-gray-800"
				>
					<Crosshair className="h-4 w-4" />
					{isLocating ? "Locating..." : "Use current location"}
				</Button>
			</div>

			<div className="h-[420px] w-full overflow-hidden rounded-2xl ring-1 ring-gray-900/5">
				<GoogleMap
					mapContainerStyle={mapContainerStyle}
					center={selected ?? defaultCenter}
					zoom={selected ? 16 : 11}
					onLoad={(m) => {
						mapRef.current = m;
					}}
					onClick={handleMapClick}
					options={{
						gestureHandling: "greedy",
						clickableIcons: false,
						streetViewControl: false,
						mapTypeControl: false,
						zoomControl: true,
					}}
				>
					{selected && (
						<MarkerF
							position={{ lat: selected.lat, lng: selected.lng }}
							draggable
							onDragEnd={(e) => {
								if (e.latLng) setLocation(e.latLng.lat(), e.latLng.lng(), false);
							}}
						/>
					)}
				</GoogleMap>
			</div>

			<p className="text-center text-xs text-gray-400">
				Tip: click anywhere on the map, or drag the pin, to fine-tune the exact spot.
			</p>

			{selected ? (
				<div className="space-y-4 rounded-2xl bg-brand-bgLightgrey p-5">
					<div className="flex items-start gap-3">
						<MapPin className="text-brand-blue mt-0.5 h-5 w-5 shrink-0" />
						<div className="min-w-0">
							<p className="text-sm font-semibold text-brand-dark">{selected.address || "Fetching address..."}</p>
							<p className="mt-1 font-mono text-xs text-gray-500">
								{selected.lat.toFixed(6)}, {selected.lng.toFixed(6)}
							</p>
						</div>
					</div>

					<div className="flex flex-col gap-2 rounded-xl bg-white p-3 ring-1 ring-gray-900/5 sm:flex-row sm:items-center">
						<span className="min-w-0 flex-1 truncate font-mono text-xs text-gray-600">{selected.googleMapsLink}</span>
						<div className="flex shrink-0 gap-2">
							<Button
								type="button"
								onClick={handleCopyLink}
								className="h-9 gap-2 rounded-[10px] bg-brand-bgLightgrey text-xs font-medium text-brand-dark hover:bg-gray-200"
							>
								<Copy className="h-3.5 w-3.5" />
								Copy
							</Button>
							<a
								href={selected.googleMapsLink}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex h-9 items-center gap-2 rounded-[10px] bg-brand-dark px-3 text-xs font-semibold text-white hover:bg-gray-800"
							>
								<ExternalLink className="h-3.5 w-3.5" />
								Open in Google Maps
							</a>
						</div>
					</div>
				</div>
			) : (
				<div className="rounded-2xl border border-dashed border-gray-200 p-5 text-center text-sm text-gray-400">
					No location selected yet — search, use your current location, or tap the map.
				</div>
			)}
		</div>
	);
};

export default LocationPicker;
