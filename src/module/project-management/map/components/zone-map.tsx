"use client";

import { GoogleMap, LoadScript, InfoWindow, MarkerF } from "@react-google-maps/api";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { IGeoTabZone, IGeoTabZoneType } from "@/module/schedule-management/schedule-configuration/types/zone";
import { env } from "@/env.mjs";
import { getZoneTypeColourMap, getZoneTypeId } from "../utils/zone";

const defaultCenter = { lat: 39.9526, lng: -75.1652 };

// Material Design location_on path (24×24 viewBox). anchor at (12, 22) = pin tip.
const PIN_PATH =
	"M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z";

interface ZoneMapProps {
	zones: IGeoTabZone[];
	zoneTypes: IGeoTabZoneType[];
	selectedZone?: IGeoTabZone | null;
	onZoneSelect?: (zone: IGeoTabZone | null) => void;
}

const ZoneMap = ({ zones, zoneTypes, selectedZone, onZoneSelect }: ZoneMapProps) => {
	const [infoZone, setInfoZone] = useState<IGeoTabZone | null>(null);
	const [isMapReady, setIsMapReady] = useState(false);
	const mapRef = useRef<google.maps.Map | null>(null);

	const colorMap = getZoneTypeColourMap({ zoneTypes });

	const center = useMemo(() => {
		const z = zones.find((z) => z.CentroidLatitude && z.CentroidLongitude);
		return z ? { lat: z.CentroidLatitude, lng: z.CentroidLongitude } : defaultCenter;
	}, [zones]);

	useEffect(() => {
		if (selectedZone?.CentroidLatitude && selectedZone?.CentroidLongitude && mapRef.current) {
			mapRef.current.panTo({ lat: selectedZone.CentroidLatitude, lng: selectedZone.CentroidLongitude });
			mapRef.current.setZoom(13);
			setInfoZone(selectedZone);
		}
	}, [selectedZone]);

	const handleMapLoad = useCallback((map: google.maps.Map) => {
		mapRef.current = map;
		setIsMapReady(true);
	}, []);

	const handleMarkerClick = useCallback(
		(zone: IGeoTabZone) => {
			setInfoZone(zone);
			onZoneSelect?.(zone);
		},
		[onZoneSelect]
	);

	return (
		<LoadScript googleMapsApiKey={env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
			<div className="relative h-full w-full">
				<GoogleMap
					mapContainerStyle={{ height: "100%", width: "100%" }}
					center={center}
					zoom={11}
					onLoad={handleMapLoad}
					options={{
						// consume scroll events for zoom instead of propagating to the page
						gestureHandling: "greedy",
						clickableIcons: false,
					}}
				>
					{isMapReady &&
						zones.map((zone, index) => {
							if (!zone.CentroidLatitude || !zone.CentroidLongitude) return null;
							const typeId = getZoneTypeId(zone);
							const color = colorMap.get(typeId ?? -1) ?? "#3B82F6";
							const isActive = selectedZone?.id === zone.id;

							return (
								<MarkerF
									key={`${zone.id}-${index}`}
									position={{ lat: zone.CentroidLatitude, lng: zone.CentroidLongitude }}
									onClick={() => handleMarkerClick(zone)}
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
							);
						})}

					{infoZone?.CentroidLatitude && infoZone?.CentroidLongitude && (
						<InfoWindow
							position={{ lat: Number(infoZone.CentroidLatitude), lng: Number(infoZone.CentroidLongitude) }}
							options={isMapReady ? { pixelOffset: new window.google.maps.Size(0, -44) } : undefined}
							onCloseClick={() => setInfoZone(null)}
						>
							<div className="min-w-[160px] p-1">
								<p className="text-sm font-semibold text-gray-800">{infoZone.Name}</p>
								{infoZone.Comment && <p className="mt-1 text-xs text-gray-500">{infoZone.Comment}</p>}
								{infoZone.ExternalReference && (
									<p className="mt-1 text-xs text-gray-400">Ref: {infoZone.ExternalReference}</p>
								)}
							</div>
						</InfoWindow>
					)}
				</GoogleMap>
			</div>
		</LoadScript>
	);
};

export default ZoneMap;
