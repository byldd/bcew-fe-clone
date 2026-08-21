"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import LocationPicker, { SelectedLocation } from "./location-picker";

const LocationPickerModal = ({
	onConfirm,
	onCancel,
	onResolveSpeedLimit,
	initialLocation,
}: {
	onConfirm: (location: SelectedLocation) => void;
	onCancel: () => void;
	onResolveSpeedLimit?: (lat: number, lng: number) => Promise<number | null>;
	initialLocation?: { lat: number; lng: number } | null;
}) => {
	const [selected, setSelected] = useState<SelectedLocation | null>(null);

	return (
		<div className="space-y-4">
			<LocationPicker
				showShareLink={false}
				onSelectedChange={setSelected}
				onResolveSpeedLimit={onResolveSpeedLimit}
				initialLocation={initialLocation}
			/>
			<div className="flex gap-3">
				<Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
					Cancel
				</Button>
				<Button
					type="button"
					variant="filled"
					className="flex-1"
					disabled={!selected}
					onClick={() => selected && onConfirm(selected)}
				>
					Confirm Location
				</Button>
			</div>
		</div>
	);
};

export default LocationPickerModal;
