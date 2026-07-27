"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useDebounce } from "@/hooks/useDebounce";
import type { IOptions } from "@/components/common/form/types";
import { mapZoneFormSchema, IMapZoneFormSchema } from "../utils/zone-schema";
import {
	buildAddressFields,
	buildEmployeePickerField,
	buildProjectPickerField,
	buildZoneNameAndTypeFields,
} from "../utils/zone-fields";
import { MAP_ZONE_CREATE_MODE, MAP_ZONE_TYPE } from "../utils/enums";
import { ICreateMapZonePayload, IGetMapZone, IMapZonePoint } from "../types/zone";
import {
	useCreateMapZone,
	useGeocodeAddressPreview,
	useGetEmployeePicker,
	useGetProjectPicker,
	useUpdateMapZone,
} from "../hooks/useMapZones";
import { useGetMapZoneTypes } from "../hooks/useMapZoneTypes";
import { useGetAccessibleMapZoneTabs } from "../hooks/useMapZoneTabs";
import ZoneDrawControl from "./zone-draw-control";
import ZoneMap from "./zone-map";

const PREVIEW_ZONE_ID = "__preview__";

const parsePoints = (points: string | null): IMapZonePoint[] => {
	if (!points) return [];
	try {
		return JSON.parse(points) as IMapZonePoint[];
	} catch {
		return [];
	}
};

interface ZoneFormModalProps {
	tabId?: string;
	zone?: IGetMapZone;
	onClose: () => void;
}

const ZoneFormModal = ({ tabId, zone, onClose }: ZoneFormModalProps) => {
	const queryClient = useQueryClient();
	const isEditing = Boolean(zone);

	const { data: zoneTypes } = useGetMapZoneTypes();
	const { data: accessibleTabs } = useGetAccessibleMapZoneTabs();
	const accessibleTabIds = useMemo(() => new Set((accessibleTabs ?? []).map((tab) => tab.id)), [accessibleTabs]);

	const [employeeSearch, setEmployeeSearch] = useState("");
	const [projectSearch, setProjectSearch] = useState("");
	const debouncedEmployeeSearch = useDebounce(employeeSearch);
	const debouncedProjectSearch = useDebounce(projectSearch);

	const form = useForm<IMapZoneFormSchema>({
		resolver: zodResolver(mapZoneFormSchema),
		defaultValues: {
			name: zone?.name ?? "",
			mapZoneTypeId: zone?.mapZoneType?.id ?? "",
			mode: zone?.points ? MAP_ZONE_CREATE_MODE.POLYGON : MAP_ZONE_CREATE_MODE.ADDRESS,
			address: zone?.address ?? "",
			city: zone?.city ?? "",
			state: zone?.state ?? "",
			zipcode: zone?.zipcode ?? "",
			country: zone?.country ?? "",
			points: parsePoints(zone?.points ?? null),
			empNum: zone?.empNum ? String(zone.empNum) : undefined,
			projectRecnum: zone?.projectRecnum ? String(zone.projectRecnum) : undefined,
		},
	});

	const name = form.watch("name");
	const mapZoneTypeId = form.watch("mapZoneTypeId");
	const mode = form.watch("mode");
	const points = form.watch("points") ?? [];
	const watchedAddress = form.watch("address");
	const watchedEmpNum = form.watch("empNum");
	const watchedProjectRecnum = form.watch("projectRecnum");

	const isEmployeeType = mapZoneTypeId === MAP_ZONE_TYPE.EMPLOYEE;
	const isProjectType = mapZoneTypeId === MAP_ZONE_TYPE.PROJECT;
	const isPickerType = isEmployeeType || isProjectType;
	// True for a zone (legacy-seeded or otherwise) that already carries its own location - points,
	// an address, or just a centroid - independent of whether it's linked to an employee/project
	// yet. Legacy zones imported from GeoTab have points/centroid but no empNum/projectRecnum
	// (that link didn't exist in the old system), so this must stay true regardless of the picker
	// so the map/points and the "draw on map" controls are visible while establishing that link.

	// Picking the Employee/Project type alone shouldn't reveal the map yet for a brand-new zone -
	// only once an actual employee/project has been picked (or the zone already has a location,
	// see above) does "this zone's location" become a meaningful question to show pins for.

	const { data: employeeOptions } = useGetEmployeePicker(debouncedEmployeeSearch);
	const { data: projectOptions } = useGetProjectPicker(debouncedProjectSearch);

	const selectedEmployeeOption = employeeOptions?.find((employee) => String(employee.empNum) === watchedEmpNum);
	const selectedProjectOption = projectOptions?.find(
		(project) => String(project.projectRecnum) === watchedProjectRecnum
	);
	// True once a picked employee/project is known to have no address on file - the form falls
	// back to manual address entry / polygon drawing for that zone, same as a custom zone type.
	const pickerOptionHasNoAddress =
		(isEmployeeType && Boolean(selectedEmployeeOption) && !selectedEmployeeOption?.address) ||
		(isProjectType && Boolean(selectedProjectOption) && !selectedProjectOption?.address);

	const { mutate: createZone, isPending: isCreating } = useCreateMapZone();
	const { mutate: updateZone, isPending: isUpdating } = useUpdateMapZone();
	const { mutate: geocodePreview, isPending: isPreviewing, data: previewResult } = useGeocodeAddressPreview();

	useEffect(() => {
		if (!isEmployeeType || !watchedEmpNum || !selectedEmployeeOption) return;
		form.setValue("address", selectedEmployeeOption.address ?? "");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [watchedEmpNum, selectedEmployeeOption]);

	useEffect(() => {
		if (!isProjectType || !watchedProjectRecnum || !selectedProjectOption) return;
		form.setValue("address", selectedProjectOption.address ?? "");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [watchedProjectRecnum, selectedProjectOption]);

	// Employee/project picks with an address resolve to a location automatically (no manual
	// "Preview location" click needed) so the map always reflects the current selection. When the
	// record has no address, the user previews manually via the button below instead.
	const debouncedPickerAddress = useDebounce(watchedAddress);
	useEffect(() => {
		if (!isPickerType || pickerOptionHasNoAddress || !debouncedPickerAddress) return;
		geocodePreview({ address: debouncedPickerAddress }, { onError: (error) => openErrorToast({ error }) });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isPickerType, pickerOptionHasNoAddress, debouncedPickerAddress]);

	const previewZone: IGetMapZone | null = useMemo(() => {
		const location = previewResult
			? {
					lat: previewResult.lat,
					lng: previewResult.lng,
				}
			: zone
				? {
						lat: zone.centroidLatitude,
						lng: zone.centroidLongitude,
					}
				: {};

		if (location.lat === undefined || location.lng === undefined) return null;

		return {
			id: PREVIEW_ZONE_ID,
			name: name || "New zone",
			address: null,
			city: null,
			state: null,
			zipcode: null,
			country: null,
			empNum: null,
			projectRecnum: null,
			centroidLatitude: location.lat,
			centroidLongitude: location.lng,
			points: null,
			fullAddress: null,
			createdAt: "",
			updatedAt: "",
			mapZoneType: mapZoneTypeId ? { id: mapZoneTypeId, name: "This zone", color: null } : undefined,
		};
	}, [previewResult, name, mapZoneTypeId, zone]);

	const previewMapZones = useMemo(() => (previewZone ? [previewZone] : []), [previewZone]);

	const zoneTypeOptions: IOptions[] = useMemo(
		() =>
			(zoneTypes ?? [])
				.filter((type) => accessibleTabIds.has(type.mapZoneTabId) || type.id === zone?.mapZoneType?.id)
				.map((type) => ({ value: type.id, label: type.name })),
		[zoneTypes, accessibleTabIds, zone]
	);

	const employeeSelectOptions: IOptions[] = useMemo(
		() => (employeeOptions ?? []).map((employee) => ({ value: String(employee.empNum), label: employee.name })),
		[employeeOptions]
	);

	const projectSelectOptions: IOptions[] = useMemo(
		() => (projectOptions ?? []).map((project) => ({ value: String(project.projectRecnum), label: project.name })),
		[projectOptions]
	);

	const handlePreviewLocation = () => {
		const values = form.getValues();
		if (!values.address?.trim()) {
			openErrorToast({ message: "Enter an address to preview" });
			return;
		}

		geocodePreview({
			address: values.address,
			city: values.city,
			state: values.state,
			zipcode: values.zipcode,
			country: values.country,
		});
	};

	const onSubmit = (values: IMapZoneFormSchema) => {
		const payload: ICreateMapZonePayload = {
			name: values.name,
			mapZoneTypeId: values.mapZoneTypeId,
			mode: values.mode,
			address: values.address,
			city: values.city,
			state: values.state,
			zipcode: values.zipcode,
			country: values.country,
			points: values.mode === MAP_ZONE_CREATE_MODE.POLYGON ? values.points : undefined,
			empNum: values.empNum ? Number(values.empNum) : undefined,
			projectRecnum: values.projectRecnum ? Number(values.projectRecnum) : undefined,
		};

		const onSuccess = () => {
			openSuccessToast(isEditing ? "Zone updated successfully." : "Zone created successfully.");
			void queryClient.invalidateQueries({ queryKey: ["map-zones"] });
			onClose();
		};

		if (isEditing && zone) {
			updateZone({ zoneId: zone.id, payload }, { onSuccess, onError: (error) => openErrorToast({ error }) });
		} else {
			createZone(payload, { onSuccess, onError: (error) => openErrorToast({ error }) });
		}
	};

	const isSubmitting = isCreating || isUpdating;

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				{buildZoneNameAndTypeFields(zoneTypeOptions).map((fieldConfig) => (
					<FormInputWrapper key={fieldConfig.name} form={form} fieldConfig={fieldConfig} />
				))}

				{isEmployeeType &&
					buildEmployeePickerField(employeeSelectOptions, setEmployeeSearch).map((fieldConfig) => (
						<FormInputWrapper key={fieldConfig.name} form={form} fieldConfig={fieldConfig} />
					))}

				{isProjectType &&
					buildProjectPickerField(projectSelectOptions, setProjectSearch).map((fieldConfig) => (
						<FormInputWrapper key={fieldConfig.name} form={form} fieldConfig={fieldConfig} />
					))}

				{isPickerType && pickerOptionHasNoAddress && (
					<p className="text-xs text-amber-600">
						This {isEmployeeType ? "employee" : "project"} has no address on file — enter one or draw the zone on the
						map.
					</p>
				)}

				{
					<div className="flex gap-2">
						<Button
							type="button"
							variant={mode === MAP_ZONE_CREATE_MODE.ADDRESS ? "filled" : "outline"}
							onClick={() => form.setValue("mode", MAP_ZONE_CREATE_MODE.ADDRESS)}
						>
							Enter address
						</Button>
						<Button
							type="button"
							variant={mode === MAP_ZONE_CREATE_MODE.POLYGON ? "filled" : "outline"}
							onClick={() => form.setValue("mode", MAP_ZONE_CREATE_MODE.POLYGON)}
						>
							Draw on map
						</Button>
					</div>
				}

				{mode === MAP_ZONE_CREATE_MODE.ADDRESS && (
					<>
						{buildAddressFields().map((fieldConfig) => (
							<FormInputWrapper key={fieldConfig.name} form={form} fieldConfig={fieldConfig} />
						))}

						{
							<div className="flex items-center gap-2">
								<Button type="button" variant="outline" onClick={handlePreviewLocation} disabled={isPreviewing}>
									Preview location
								</Button>
								{previewResult && (
									<span className="text-xs text-brand-grey">
										Found: {previewResult.lat.toFixed(5)}, {previewResult.lng.toFixed(5)}
									</span>
								)}
							</div>
						}

						{isPickerType && !pickerOptionHasNoAddress && watchedAddress && (
							<p className="text-xs text-brand-grey">{isPreviewing ? "Locating…" : watchedAddress}</p>
						)}

						{previewZone && (
							<div className="h-[280px] w-full overflow-hidden rounded-lg border border-grey-400">
								<ZoneMap zones={previewMapZones} selectedId={previewZone.id} />
							</div>
						)}
					</>
				)}

				{mode === MAP_ZONE_CREATE_MODE.POLYGON && (
					<ZoneDrawControl
						points={points}
						onChange={(next) => form.setValue("points", next, { shouldValidate: true })}
					/>
				)}

				<div className="flex w-full gap-2">
					<Button onClick={onClose} type="button" variant="outline" className="w-full" disabled={isSubmitting}>
						Cancel
					</Button>
					<Button type="submit" variant="filled" className="w-full" disabled={isSubmitting}>
						{isEditing ? "Save changes" : "Create zone"}
					</Button>
				</div>
			</form>
		</Form>
	);
};

export default ZoneFormModal;
