/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import { GoogleMap, LoadScript, DrawingManager, Autocomplete } from "@react-google-maps/api";
import { useState } from "react";
import { Button } from "./ui/button";
export type LatLngPoint = {
	lat: number;
	lng: number;
};

export type GeotabPoint = {
	x: number; // lng
	y: number; // lat
};

export type ZonePayload = {
	name: string;
	points: GeotabPoint[];
};

export function circleToPolygon(center: google.maps.LatLng, radius: number, numPoints = 20): GeotabPoint[] {
	const points: GeotabPoint[] = [];
	const lat = center.lat();
	const lng = center.lng();

	for (let i = 0; i < numPoints; i++) {
		const angle = (i * 2 * Math.PI) / numPoints;

		const dx = radius * Math.cos(angle);
		const dy = radius * Math.sin(angle);

		const newLat = lat + dy / 111320;
		const newLng = lng + dx / (111320 * Math.cos((lat * Math.PI) / 180));

		points.push({ x: newLng, y: newLat });
	}

	return points;
}

const libraries: ("drawing" | "places")[] = ["drawing", "places"];

export default function MapZonePicker() {
	const [map, setMap] = useState<google.maps.Map | null>(null);
	const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

	const [zonePoints, setZonePoints] = useState<GeotabPoint[]>([]);

	const center = { lat: 22.7196, lng: 75.8577 };

	const onPlaceChanged = () => {
		if (!autocomplete || !map) return;

		const place = autocomplete.getPlace();
		if (!place.geometry) return;

		const loc = place.geometry.location;
		if (!loc) return;
		map.panTo({ lat: loc?.lat(), lng: loc?.lng() });
	};

	const handlePolygon = (polygon: google.maps.Polygon) => {
		const path = polygon.getPath();
		const points: GeotabPoint[] = [];

		for (let i = 0; i < path.getLength(); i++) {
			const p = path.getAt(i);
			points.push({ x: p.lng(), y: p.lat() });
		}

		setZonePoints(points);
	};

	const handleCircle = (circle: google.maps.Circle) => {
		console.log("circle", circle);
		const center = circle.getCenter();
		const radius = circle.getRadius();

		if (!center) return;

		const polygon = circleToPolygon(center, radius);
		setZonePoints(polygon);
	};

	const saveZone = async () => {
		const payload: ZonePayload = {
			name: "My Zone",
			points: zonePoints,
		};

		// await axios.post("http://localhost:5000/create-zone", payload);
		// alert("Zone created!");
	};

	console.log("zonePoints", zonePoints);
	return (
		<LoadScript googleMapsApiKey={"AIzaSyB5E433wd4ga9hI_X59nZq88OwhOwKG5-M"} libraries={libraries}>
			<div style={{ height: "90vh", width: "100%" }}>
				<Autocomplete onLoad={(a) => setAutocomplete(a)} onPlaceChanged={onPlaceChanged}>
					<input
						placeholder="Search location"
						style={{
							width: "300px",
							height: "40px",
							position: "absolute",
							top: "10px",
							left: "50%",
							marginLeft: "-150px",
							zIndex: 10,
						}}
					/>
				</Autocomplete>

				<GoogleMap
					mapContainerStyle={{ width: "100%", height: "80%" }}
					center={center}
					zoom={12}
					onLoad={(m) => setMap(m)}
				>
					<DrawingManager
						onPolygonComplete={handlePolygon}
						onCircleComplete={handleCircle}
						options={{
							drawingControl: true,
							drawingControlOptions: {
								// @ts-ignore
								drawingModes: ["polygon"],
							},
						}}
					/>
				</GoogleMap>

				<Button onClick={saveZone}>Save Zone</Button>
			</div>
		</LoadScript>
	);
}
