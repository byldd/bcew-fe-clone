"use client";

import { GoogleMap, LoadScript, InfoWindow, MarkerF } from "@react-google-maps/api";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { env } from "@/env.mjs";
import { ITabMapMarker } from "../types/zone";

const defaultCenter = { lat: 39.9526, lng: -75.1652 };

const PIN_PATH =
	"M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z";

interface TabMapProps {
	markers: ITabMapMarker[];
	selectedId?: string | number | null;
	onMarkerClick?: (id: string | number) => void;
	onMarkerHover?: (id: string | number | null) => void;
}

const TabMap = ({ markers, selectedId, onMarkerClick, onMarkerHover }: TabMapProps) => {
	const [infoMarker, setInfoMarker] = useState<ITabMapMarker | null>(null);
	const [isMapReady, setIsMapReady] = useState(false);
	const mapRef = useRef<google.maps.Map | null>(null);
	const fittedMarkersKeyRef = useRef<string | null>(null);
	const markersRef = useRef(markers);
	markersRef.current = markers;

	const center = useMemo(() => {
		const m = markers.find((m) => m.lat && m.lng);
		return m ? { lat: m.lat, lng: m.lng } : defaultCenter;
	}, [markers]);

	// Zoom/pan only on a real click (selectedId change) — reading `markers` via a ref keeps this
	// effect from re-firing on renders that merely produce a new `markers` array reference (e.g.
	// a hover-driven parent re-render), which would otherwise re-zoom to the clicked pin on hover.
	useEffect(() => {
		const selected = markersRef.current.find((m) => m.id === selectedId);
		if (selected && mapRef.current) {
			mapRef.current.panTo({ lat: selected.lat, lng: selected.lng });
			mapRef.current.setZoom(13);
			setInfoMarker(selected);
		}
	}, [selectedId]);

	// Re-fit the viewport to whatever set of markers is currently visible. Since this only
	// depends on `markers`, any current or future filter that narrows/widens that array
	// automatically re-frames the map — no per-filter zoom wiring needed.
	useEffect(() => {
		if (!isMapReady || !mapRef.current) return;

		const key = markers.map((m) => m.id).join("|");
		if (key === fittedMarkersKeyRef.current) return;
		fittedMarkersKeyRef.current = key;

		const onlyMarker = markers.length === 1 ? markers[0] : undefined;

		if (!onlyMarker && markers.length === 0) return;

		if (onlyMarker) {
			mapRef.current.panTo({ lat: onlyMarker.lat, lng: onlyMarker.lng });
			mapRef.current.setZoom(13);
			return;
		}

		const bounds = new window.google.maps.LatLngBounds();
		markers.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }));
		mapRef.current.fitBounds(bounds, 48);
	}, [markers, isMapReady]);

	const handleMapLoad = useCallback((map: google.maps.Map) => {
		mapRef.current = map;
		setIsMapReady(true);
	}, []);

	const handleMarkerClick = useCallback(
		(marker: ITabMapMarker) => {
			setInfoMarker(marker);
			onMarkerClick?.(marker.id);
		},
		[onMarkerClick]
	);

	// Hover only surfaces the popover and lets the parent focus/scroll the matching card —
	// it must never pan/zoom the map, unlike a click (which drives `selectedId` above).
	const handleMarkerMouseOver = useCallback((marker: ITabMapMarker) => {
		setInfoMarker(marker);
	}, []);

	const handleMarkerMouseOut = useCallback(
		(marker: ITabMapMarker) => {
			if (marker.id !== selectedId) {
				setInfoMarker((prev) => (prev?.id === marker.id ? null : prev));
			}
			onMarkerHover?.(null);
		},
		[onMarkerHover, selectedId]
	);

	return (
		<LoadScript googleMapsApiKey={env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
			<div className="map-info-window relative h-full w-full">
				<GoogleMap
					mapContainerStyle={{ height: "100%", width: "100%" }}
					center={center}
					zoom={11}
					onLoad={handleMapLoad}
					options={{ gestureHandling: "greedy", clickableIcons: false, zoomControl: true }}
				>
					{isMapReady &&
						markers.map((marker, index) => {
							const isActive = selectedId === marker.id;
							return (
								<MarkerF
									key={`${marker.id}-${index}`}
									position={{ lat: marker.lat, lng: marker.lng }}
									onClick={() => handleMarkerClick(marker)}
									onMouseOver={() => handleMarkerMouseOver(marker)}
									onMouseOut={() => handleMarkerMouseOut(marker)}
									zIndex={isActive ? 999 : 1}
									icon={{
										path: PIN_PATH,
										fillColor: marker.color,
										fillOpacity: 1,
										strokeColor: "white",
										strokeWeight: isActive ? 2 : 1.5,
										scale: isActive ? 2.2 : 1.8,
										anchor: new window.google.maps.Point(12, 22),
									}}
								/>
							);
						})}

					{infoMarker && (
						<InfoWindow
							position={{ lat: infoMarker.lat, lng: infoMarker.lng }}
							options={isMapReady ? { pixelOffset: new window.google.maps.Size(0, -44) } : undefined}
							onCloseClick={() => setInfoMarker(null)}
						>
							<div className="min-w-[160px] py-0 pl-1 pr-4">
								<p className="text-sm font-semibold leading-tight text-gray-800">{infoMarker.title}</p>
								{infoMarker.subtitle && (
									<p className="mt-0.5 text-xs leading-tight text-gray-500">{infoMarker.subtitle}</p>
								)}
							</div>
						</InfoWindow>
					)}
				</GoogleMap>
			</div>
		</LoadScript>
	);
};

export default TabMap;
