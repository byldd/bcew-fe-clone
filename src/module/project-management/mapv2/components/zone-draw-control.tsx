"use client";

import { useCallback, useState } from "react";
import { GoogleMap, MarkerF, Polygon, Polyline } from "@react-google-maps/api";
import { Hexagon, Trash2, Undo2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { openErrorToast } from "@/components/toast";
import { cn } from "@/lib/utils/utils";
import { useGoogleMapsLoader } from "../hooks/useGoogleMapsLoader";
import { MAX_ZONE_POLYGON_POINTS, MIN_ZONE_POLYGON_POINTS } from "../utils/constants";
import { IMapZonePoint } from "../types/zone";
import { toLatLng } from "../utils/zone-points";

const defaultCenter = { lat: 39.9526, lng: -75.1652 };
const POLYGON_COLOR = "#3B82F6";

interface ZoneDrawControlProps {
	points: IMapZonePoint[];
	onChange: (points: IMapZonePoint[]) => void;
}

// Google removed the Drawing library (DrawingManager) from the Maps JavaScript API, so this
// rebuilds the same UX by hand: a toggle button arms "click the map to add a point", and every
// vertex is its own always-draggable marker so you can grab and adjust any point regardless of
// whether the add-point tool is on. The polygon/polyline shape itself is a plain read-only
// overlay driven from `points` - it is never `editable`, since Google's own editable-polygon
// click handling (inserting a vertex where you click near an edge) fought with our own
// append-to-end click handler and produced crossed edges.
const ZoneDrawControl = ({ points, onChange }: ZoneDrawControlProps) => {
	const { isLoaded } = useGoogleMapsLoader();
	const [isDrawing, setIsDrawing] = useState(points.length === 0);
	// Set once on mount and never recomputed - passing a fresh `points[0] ?? defaultCenter` value
	// as `center` on every render (e.g. after Clear resets points to []) makes GoogleMap jump back
	// to that value, fighting any panning/zooming the user already did.
	const [mapCenter] = useState<google.maps.LatLngLiteral>(() => (points[0] ? toLatLng(points[0]) : defaultCenter));
	// Captured once so editing an existing zone opens already zoomed/framed to its points instead
	// of requiring the user to hunt for the pins and zoom in manually.
	const [initialPoints] = useState<IMapZonePoint[]>(() => points);

	const handleMapLoad = useCallback(
		(map: google.maps.Map) => {
			const onlyPoint = initialPoints.length === 1 ? initialPoints[0] : undefined;

			if (onlyPoint) {
				map.setCenter(toLatLng(onlyPoint));
				map.setZoom(15);
			} else if (initialPoints.length >= 2) {
				const bounds = new window.google.maps.LatLngBounds();
				initialPoints.forEach((point) => bounds.extend(toLatLng(point)));
				map.fitBounds(bounds, 48);
			}
		},
		[initialPoints]
	);

	const handleMapClick = useCallback(
		(event: google.maps.MapMouseEvent) => {
			if (!isDrawing || !event.latLng) return;

			if (points.length >= MAX_ZONE_POLYGON_POINTS) {
				openErrorToast({ message: `A zone polygon cannot have more than ${MAX_ZONE_POLYGON_POINTS} points` });
				return;
			}

			onChange([...points, { X: event.latLng.lng(), Y: event.latLng.lat() }]);
		},
		[isDrawing, points, onChange]
	);

	const handleVertexDragEnd = useCallback(
		(index: number, event: google.maps.MapMouseEvent) => {
			const latLng = event.latLng;
			if (!latLng) return;

			onChange(points.map((point, i) => (i === index ? { X: latLng.lng(), Y: latLng.lat() } : point)));
		},
		[points, onChange]
	);

	const handleUndo = () => onChange(points.slice(0, -1));

	const handleClear = () => {
		onChange([]);
		setIsDrawing(true);
	};

	if (!isLoaded) {
		return (
			<div className="flex h-[320px] w-full items-center justify-center rounded-lg border border-grey-400">
				<Spinner />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="relative h-[320px] w-full overflow-hidden rounded-lg border border-grey-400">
				<GoogleMap
					mapContainerStyle={{ height: "100%", width: "100%" }}
					center={mapCenter}
					zoom={11}
					onLoad={handleMapLoad}
					onClick={handleMapClick}
					options={{
						gestureHandling: "greedy",
						clickableIcons: false,
						draggableCursor: isDrawing ? "crosshair" : undefined,
						zoomControl: true,
						zoomControlOptions: { position: window.google.maps.ControlPosition.LEFT_BOTTOM },
					}}
				>
					{points.length >= MIN_ZONE_POLYGON_POINTS && (
						<Polygon
							paths={points.map(toLatLng)}
							options={{
								fillColor: POLYGON_COLOR,
								fillOpacity: 0.25,
								strokeColor: POLYGON_COLOR,
								strokeWeight: 2,
								clickable: false,
							}}
						/>
					)}

					{points.length > 0 && points.length < MIN_ZONE_POLYGON_POINTS && (
						<Polyline
							path={points.map(toLatLng)}
							options={{ strokeColor: POLYGON_COLOR, strokeWeight: 2, clickable: false }}
						/>
					)}

					{points.map((point, index) => (
						<MarkerF
							key={index}
							position={toLatLng(point)}
							draggable
							onDragEnd={(event) => handleVertexDragEnd(index, event)}
							zIndex={999}
							icon={{
								path: window.google.maps.SymbolPath.CIRCLE,
								scale: 6,
								fillColor: "#ffffff",
								fillOpacity: 1,
								strokeColor: POLYGON_COLOR,
								strokeWeight: 2,
							}}
						/>
					))}
				</GoogleMap>

				<div className="absolute right-2.5 top-2.5 flex flex-col gap-1.5">
					<button
						type="button"
						onClick={() => setIsDrawing((prev) => !prev)}
						aria-label={isDrawing ? "Stop drawing" : "Draw polygon"}
						aria-pressed={isDrawing}
						title={isDrawing ? "Stop drawing" : "Draw polygon"}
						className={cn(
							"flex h-9 w-9 items-center justify-center rounded-md border border-black/10 bg-white shadow-md transition-colors hover:bg-brand-dark10",
							isDrawing && "bg-brand-dark text-white hover:bg-brand-dark"
						)}
					>
						<Hexagon size={18} />
					</button>
					<button
						type="button"
						onClick={handleUndo}
						disabled={points.length === 0}
						aria-label="Undo last point"
						title="Undo last point"
						className="flex h-9 w-9 items-center justify-center rounded-md border border-black/10 bg-white text-brand-dark shadow-md transition-colors hover:bg-brand-dark10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
					>
						<Undo2 size={18} />
					</button>
					<button
						type="button"
						onClick={handleClear}
						disabled={points.length === 0}
						aria-label="Clear polygon"
						title="Clear polygon"
						className="flex h-9 w-9 items-center justify-center rounded-md border border-black/10 bg-white text-brand-dark shadow-md transition-colors hover:bg-brand-dark10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
					>
						<Trash2 size={18} />
					</button>
				</div>
			</div>
			<p className="text-xs text-brand-grey">
				{points.length === 0
					? `Click the polygon tool, then click the map to place points (${MIN_ZONE_POLYGON_POINTS}-${MAX_ZONE_POLYGON_POINTS})`
					: `${points.length} point${points.length === 1 ? "" : "s"} placed - drag any point to adjust it`}
			</p>
		</div>
	);
};

export default ZoneDrawControl;
