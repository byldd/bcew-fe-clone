import { type FieldValues, type Path, type PathValue, useFormContext } from "react-hook-form";
import { MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/api";
import { IApiResponse } from "@/types";
import { cn } from "@/lib/utils/utils";
import { formatLatLng, formatLatLngInput, INVALID_LAT_LNG_MESSAGE, parseLatLng } from "@/lib/utils/coordinates";
import LocationPickerModal from "@/module/public/components/location-picker-modal";
import type { FormLocationProps } from "@/components/common/form/types";

export function FormLocationInput<TData extends FieldValues>({
	field,
	fieldConfig,
	className,
	disabled,
}: FormLocationProps<TData>) {
	const { Modal, openModal, closeModal } = useModal();
	const { setValue, setError, clearErrors } = useFormContext<TData>();

	const { speedLimitFieldName, speedLimitEndpoint } = fieldConfig;
	const speedEnabled = Boolean(speedLimitFieldName && speedLimitEndpoint);

	const resolveSpeedLimit = async (lat: number, lng: number): Promise<number | null> => {
		const { data } = await apiClient.get<IApiResponse<{ speedLimit: number; units: string } | null>>(
			speedLimitEndpoint!,
			{
				params: { lat, lng },
			}
		);
		return data.data?.speedLimit ?? null;
	};

	const applySpeedLimit = (speedLimit: number | null | undefined) => {
		if (!speedLimitFieldName) return;
		setValue(speedLimitFieldName as Path<TData>, (speedLimit ?? undefined) as PathValue<TData, Path<TData>>, {
			shouldValidate: true,
			shouldDirty: true,
		});
	};

	const openPicker = () => {
		openModal({
			modalTitle: "Select Location",
			variant: "medium",
			modalView: (
				<LocationPickerModal
					initialLocation={parseLatLng((field.value ?? "").trim())}
					onResolveSpeedLimit={speedEnabled ? resolveSpeedLimit : undefined}
					onConfirm={(location) => {
						field.onChange(formatLatLng(location.lat, location.lng));
						clearErrors(field.name);
						applySpeedLimit(location.speedLimit);
						closeModal();
					}}
					onCancel={closeModal}
				/>
			),
		});
	};

	const handleBlur = async () => {
		field.onBlur();
		const value = (field.value ?? "").trim();
		if (value === "") {
			clearErrors(field.name);
			return;
		}

		const coords = parseLatLng(value);
		if (!coords) {
			setError(field.name, { type: "manual", message: INVALID_LAT_LNG_MESSAGE });
			return;
		}

		clearErrors(field.name);
		if (!speedEnabled) return;
		try {
			applySpeedLimit(await resolveSpeedLimit(coords.lat, coords.lng));
		} catch {
			// Speed limit is best-effort — a lookup failure must not block a manually entered location.
		}
	};

	return (
		<div className="flex items-center gap-3">
			<Input
				id={field.name}
				value={field.value ?? ""}
				onChange={(event) => {
					const previous = (field.value ?? "") as string;
					const next = event.target.value;
					field.onChange(formatLatLngInput(next, next.length < previous.length));
				}}
				onBlur={handleBlur}
				inputMode="text"
				placeholder={fieldConfig.placeholder ?? "Latitude, Longitude"}
				disabled={disabled}
				className={cn("rounded-[8px] border-none bg-brand-bgLightgrey", fieldConfig.className, className)}
			/>
			<Button type="button" variant="filled" disabled={disabled} onClick={openPicker} className="shrink-0 gap-2">
				<MapPin className="h-4 w-4" />
				Select Location
			</Button>
			<Modal />
		</div>
	);
}
