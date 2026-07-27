"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, MarkerF, Polygon, InfoWindow } from "@react-google-maps/api";
import { Spinner } from "@/components/ui/spinner";
import { useGoogleMapsLoader } from "../hooks/useGoogleMapsLoader";
import { IGetMapZone, IMapZonePoint } from "../types/zone";
import { getZoneColor } from "../utils/zone-color";
import { toLatLng } from "../utils/zone-points";

const defaultCenter = { lat: 39.9526, lng: -75.1652 };

const PIN_PATH =
	"M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z";

interface ZoneMapProps {
	zones: IGetMapZone[];
	selectedId?: string | null;
	onZoneClick?: (id: string) => void;
}

const parsePoints = (points: string | null): IMapZonePoint[] => {
	if (!points) return [];
	try {
		return JSON.parse(points) as IMapZonePoint[];
	} catch {
		return [];
	}
};

const ZoneMap = ({ zones, selectedId, onZoneClick }: ZoneMapProps) => {
	const { isLoaded } = useGoogleMapsLoader();
	const [isMapReady, setIsMapReady] = useState(false);
	const [infoZone, setInfoZone] = useState<IGetMapZone | null>(null);
	const mapRef = useRef<google.maps.Map | null>(null);
	const fittedZonesKeyRef = useRef<string | null>(null);

	const zonesWithLocation = useMemo(
		() => zones.filter((zone) => zone.centroidLatitude && zone.centroidLongitude),
		[zones]
	);

	const center = useMemo(() => {
		const first = zonesWithLocation[0];
		return first ? { lat: first.centroidLatitude!, lng: first.centroidLongitude! } : defaultCenter;
	}, [zonesWithLocation]);

	const handleMapLoad = useCallback((map: google.maps.Map) => {
		mapRef.current = map;
		setIsMapReady(true);
	}, []);

	// Re-fit the viewport to whatever set of zones is currently visible (mirrors tab-map.tsx).
	useEffect(() => {
		if (!isMapReady || !mapRef.current) return;

		const key = zonesWithLocation
			.map((zone) => `${zone.id}:${zone.centroidLatitude}:${zone.centroidLongitude}`)
			.join("|");
		if (key === fittedZonesKeyRef.current) return;
		fittedZonesKeyRef.current = key;

		if (zonesWithLocation.length === 0) return;

		const onlyZone = zonesWithLocation.length === 1 ? zonesWithLocation[0] : undefined;
		if (onlyZone) {
			mapRef.current.panTo({ lat: onlyZone.centroidLatitude!, lng: onlyZone.centroidLongitude! });
			mapRef.current.setZoom(13);
			return;
		}

		const bounds = new window.google.maps.LatLngBounds();
		zonesWithLocation.forEach((zone) => bounds.extend({ lat: zone.centroidLatitude!, lng: zone.centroidLongitude! }));
		mapRef.current.fitBounds(bounds, 48);
	}, [zonesWithLocation, isMapReady]);

	useEffect(() => {
		const selected = zonesWithLocation.find((zone) => zone.id === selectedId);
		if (selected && mapRef.current) {
			mapRef.current.panTo({ lat: selected.centroidLatitude!, lng: selected.centroidLongitude! });
			mapRef.current.setZoom(14);
			setInfoZone(selected);
		}
	}, [selectedId, zonesWithLocation]);

	const handleZoneClick = useCallback(
		(zone: IGetMapZone) => {
			setInfoZone(zone);
			onZoneClick?.(zone.id);
		},
		[onZoneClick]
	);

	// Hover only surfaces the info card on the pin - it must never pan/zoom the map, unlike a
	// click (which drives `selectedId` and the pan/zoom effect above).
	const handleZoneMouseOver = useCallback((zone: IGetMapZone) => {
		setInfoZone(zone);
	}, []);

	const handleZoneMouseOut = useCallback(
		(zone: IGetMapZone) => {
			if (zone.id !== selectedId) {
				setInfoZone((prev) => (prev?.id === zone.id ? null : prev));
			}
		},
		[selectedId]
	);

	if (!isLoaded) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<Spinner />
			</div>
		);
	}

	return (
		<div className="map-info-window relative h-full w-full">
			<GoogleMap
				mapContainerStyle={{ height: "100%", width: "100%" }}
				center={center}
				zoom={11}
				onLoad={handleMapLoad}
				options={{ gestureHandling: "greedy", clickableIcons: false, zoomControl: true }}
			>
				{isMapReady &&
					zonesWithLocation.map((zone) => {
						const color = zone.mapZoneType?.color ?? getZoneColor(zone.mapZoneType?.id ?? zone.id);
						const isActive = selectedId === zone.id;
						const points = parsePoints(zone.points);

						return (
							<Fragment key={zone.id}>
								{points.length > 0 && (
									<Polygon
										paths={points.map(toLatLng)}
										onClick={() => handleZoneClick(zone)}
										options={{
											fillColor: color,
											fillOpacity: isActive ? 0.5 : 0.25,
											strokeColor: color,
											strokeWeight: isActive ? 3 : 1.5,
										}}
									/>
								)}
								<MarkerF
									position={{ lat: zone.centroidLatitude!, lng: zone.centroidLongitude! }}
									onClick={() => handleZoneClick(zone)}
									onMouseOver={() => handleZoneMouseOver(zone)}
									onMouseOut={() => handleZoneMouseOut(zone)}
									zIndex={isActive ? 999 : 1}
									icon={{
										path: PIN_PATH,
										fillColor: color,
										fillOpacity: 1,
										strokeColor: "white",
										strokeWeight: isActive ? 2 : 1.5,
										scale: isActive ? 2.2 : 1.8,
										anchor: new window.google.maps.Point(12, 22),
									}}
								/>
							</Fragment>
						);
					})}

				{infoZone && (
					<InfoWindow
						position={{ lat: infoZone.centroidLatitude!, lng: infoZone.centroidLongitude! }}
						options={{ pixelOffset: new window.google.maps.Size(0, -44) }}
						onCloseClick={() => setInfoZone(null)}
					>
						<div className="min-w-[160px] py-0 pl-1 pr-4">
							<p className="text-sm font-semibold leading-tight text-gray-800">{infoZone.name}</p>
							<p className="mt-0.5 text-xs leading-tight text-gray-500">{infoZone.mapZoneType?.name}</p>
							{infoZone.fullAddress && (
								<p className="mt-1 text-xs leading-tight text-gray-500">{infoZone.fullAddress}</p>
							)}
						</div>
					</InfoWindow>
				)}
			</GoogleMap>
		</div>
	);
};

export default ZoneMap;
