"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { getMaterialSelectionReasonLabel } from "@/module/job/material-selection/utils";
import type { MaterialRequestFiltersProps } from "../utils/types";
import { ALL_VALUE, PHASE_OPTIONS } from "../utils/constants";
import { PlusIcon, Star, StarOff, Trash2, X } from "lucide-react";
import { MATERIAL_REQUEST_FILTER_TYPE, MATERIAL_REQUEST_VIEW_MODE } from "../utils/enums";
import { applyMaterialRequestFilters, normalizeFilters } from "../utils";
import Image from "next/image";

import { Input } from "@/components/ui/input";
import { FilterSelectPopover } from "./filter-select-popover";
import {
	useCreateMaterialRequestSavedView,
	useDeleteMaterialRequestSavedView,
	useMaterialRequestSavedViews,
	useUpdateMaterialRequestSavedView,
} from "@/module/material-management/material-requests/hooks/useMaterialRequests";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { FILTER_SAVED_VIEW_PAGE_KEY } from "@/utils/enums";

const MaterialRequestFilters = ({
	startDate,
	endDate,
	onDateRangeChange,
	filters,
	onFilterChange,
	onResetFilters,
	onApplySavedView,
	rows,
	isForeman,
	showViewModeTabs,
	foremanViewMode,
	onForemanViewModeChange,
}: MaterialRequestFiltersProps) => {
	const [hasAppliedInitialView, setHasAppliedInitialView] = useState(false);

	const [isAddingView, setIsAddingView] = useState(false);

	const [viewName, setViewName] = useState("");

	const [contextMenu, setContextMenu] = useState<{
		x: number;
		y: number;
		viewId: string;
	} | null>(null);

	const { data: savedViewsData } = useMaterialRequestSavedViews();

	const savedViews = savedViewsData?.items ?? [];

	const selectedView = savedViews.find((view) => view.isLastViewed) ?? null;

	const selectedViewId = selectedView?.id ?? null;

	const { mutate: createView, isPending: isCreatingView } = useCreateMaterialRequestSavedView();

	const { mutate: updateView, isPending: isUpdatingView } = useUpdateMaterialRequestSavedView();

	const { mutate: deleteView, isPending: isDeletingView } = useDeleteMaterialRequestSavedView();

	const selectedContextView = savedViews.find((view) => view.id === contextMenu?.viewId);

	const handlePlusIconClick = () => {
		if (isAddingView) return;

		setIsAddingView(true);
		setViewName("");
	};

	const handleSaveViewClick = () => {
		if (!isAddingView) return;

		const trimmedName = viewName.trim();

		if (!trimmedName) {
			openErrorToast({
				message: "Please enter a view name",
			});
			return;
		}

		createView(
			{
				name: trimmedName,

				pageKey: FILTER_SAVED_VIEW_PAGE_KEY.MATERIAL_REQUESTS,

				filters,

				isLastViewed: true,
			},
			{
				onSuccess: (view) => {
					openSuccessToast(`${view?.name} created.`);

					setIsAddingView(false);

					setViewName("");
				},

				onError: (error) =>
					openErrorToast({
						error,
					}),
			}
		);
	};

	const handleDefaultViewClick = () => {
		onResetFilters();

		if (!selectedViewId) return;

		updateView(
			{
				viewId: selectedViewId,

				payload: {
					isLastViewed: false,
				},
			},
			{
				onError: (error) =>
					openErrorToast({
						error,
					}),
			}
		);
	};

	const handleForemanDefaultViewClick = () => {
		onForemanViewModeChange?.(MATERIAL_REQUEST_VIEW_MODE.ALL);

		if (!selectedViewId) return;

		updateView(
			{
				viewId: selectedViewId,

				payload: {
					isLastViewed: false,
				},
			},
			{
				onError: (error) =>
					openErrorToast({
						error,
					}),
			}
		);
	};

	const handleMyRequestsClick = () => {
		onForemanViewModeChange?.(MATERIAL_REQUEST_VIEW_MODE.MY_REQUESTS);

		if (!selectedViewId) return;

		updateView(
			{
				viewId: selectedViewId,

				payload: {
					isLastViewed: false,
				},
			},
			{
				onError: (error) =>
					openErrorToast({
						error,
					}),
			}
		);
	};

	const handleSavedViewClick = (view: (typeof savedViews)[number]) => {
		onApplySavedView(view.id, view.filters);

		updateView(
			{
				viewId: view.id,

				payload: {
					isLastViewed: true,
				},
			},
			{
				onError: (error) =>
					openErrorToast({
						error,
					}),
			}
		);
	};

	const handleSetDefault = (viewId: string) => {
		updateView(
			{
				viewId,

				payload: {
					isDefault: true,
				},
			},
			{
				onSuccess: () => {
					openSuccessToast("Favorite view created.");

					setContextMenu(null);
				},

				onError: (error) =>
					openErrorToast({
						error,
					}),
			}
		);
	};

	const handleDeleteView = (viewId: string) => {
		const isDeletingSelectedView = selectedViewId === viewId;

		deleteView(viewId, {
			onSuccess: () => {
				if (isDeletingSelectedView) {
					onResetFilters();
				}

				openSuccessToast("View deleted.");

				setContextMenu(null);
			},

			onError: (error) =>
				openErrorToast({
					error,
				}),
		});
	};

	const handleUpdateCurrentView = () => {
		if (!selectedViewId) return;

		updateView(
			{
				viewId: selectedViewId,

				payload: {
					filters,
				},
			},
			{
				onSuccess: () => {
					openSuccessToast("View updated.");
				},

				onError: (error) =>
					openErrorToast({
						error,
					}),
			}
		);
	};

	const handleRemoveDefault = (viewId: string) => {
		updateView(
			{
				viewId,
				payload: {
					isDefault: false,
				},
			},
			{
				onSuccess: () => {
					openSuccessToast("Favorite removed.");

					setContextMenu(null);
				},

				onError: (error) =>
					openErrorToast({
						error,
					}),
			}
		);
	};

	const rowsForBuilder = useMemo(
		() => applyMaterialRequestFilters(rows, { ...filters, builderFilter: "" }),
		[rows, filters]
	);
	const rowsForProject = useMemo(
		() => applyMaterialRequestFilters(rows, { ...filters, projectFilter: "" }),
		[rows, filters]
	);
	const rowsForJobNumber = useMemo(
		() => applyMaterialRequestFilters(rows, { ...filters, jobNumberFilter: "" }),
		[rows, filters]
	);
	const rowsForJobName = useMemo(
		() => applyMaterialRequestFilters(rows, { ...filters, jobFilter: "" }),
		[rows, filters]
	);
	const rowsForModel = useMemo(
		() => applyMaterialRequestFilters(rows, { ...filters, modelFilter: "" }),
		[rows, filters]
	);
	const rowsForPartCode = useMemo(
		() => applyMaterialRequestFilters(rows, { ...filters, partCodeFilter: "" }),
		[rows, filters]
	);
	const rowsForPartName = useMemo(
		() => applyMaterialRequestFilters(rows, { ...filters, partNameFilter: "" }),
		[rows, filters]
	);
	const rowsForDepartment = useMemo(
		() => applyMaterialRequestFilters(rows, { ...filters, departmentFilter: "" }),
		[rows, filters]
	);
	const rowsForRequestedBy = useMemo(
		() => applyMaterialRequestFilters(rows, { ...filters, requestedByFilter: "" }),
		[rows, filters]
	);
	const rowsForReason = useMemo(
		() => applyMaterialRequestFilters(rows, { ...filters, reasonFilter: "" }),
		[rows, filters]
	);

	// ── Options derived from cross-filtered rows ─────────────────────────────
	const jobNumberOptions = useMemo(() => {
		const values = rowsForJobNumber
			.map((row) => (row.jobId != null ? { value: row.jobId.toString(), label: row.jobId.toString() } : null))
			.filter((item): item is { value: string; label: string } => !!item);
		const unique = new Map<string, { value: string; label: string }>();
		values.forEach((item) => unique.set(item.value, item));
		return Array.from(unique.values());
	}, [rowsForJobNumber]);

	const jobNameOptions = useMemo(() => {
		const values = rowsForJobName
			.map((row) => (row.jobName?.trim() ? { value: row.jobName.toLowerCase(), label: row.jobName } : null))
			.filter((item): item is { value: string; label: string } => !!item);
		const unique = new Map<string, { value: string; label: string }>();
		values.forEach((item) => unique.set(item.value, item));
		return Array.from(unique.values());
	}, [rowsForJobName]);

	const builderOptions = useMemo(() => {
		const values = rowsForBuilder
			.map((row) => (row.builderName?.trim() ? { value: row.builderName.toLowerCase(), label: row.builderName } : null))
			.filter((item): item is { value: string; label: string } => !!item);
		const unique = new Map<string, { value: string; label: string }>();
		values.forEach((item) => unique.set(item.value, item));
		return Array.from(unique.values());
	}, [rowsForBuilder]);

	const projectOptions = useMemo(() => {
		const values = rowsForProject
			.map((row) => (row.projectName?.trim() ? { value: row.projectName.toLowerCase(), label: row.projectName } : null))
			.filter((item): item is { value: string; label: string } => !!item);
		const unique = new Map<string, { value: string; label: string }>();
		values.forEach((item) => unique.set(item.value, item));
		return Array.from(unique.values());
	}, [rowsForProject]);

	const modelOptions = useMemo(() => {
		const values = rowsForModel
			.map((row) => row.model)
			.filter((value): value is string => !!value && value.trim().length > 0);
		return Array.from(new Set(values)).map((value) => ({ value, label: value }));
	}, [rowsForModel]);

	const partCodeOptions = useMemo(() => {
		const values = rowsForPartCode.map((row) => row.code?.trim()).filter((v): v is string => !!v && v.length > 0);
		return Array.from(new Set(values)).map((value) => ({ value, label: value }));
	}, [rowsForPartCode]);

	const partNameOptions = useMemo(() => {
		const values = rowsForPartName.map((row) => row.name?.trim()).filter((v): v is string => !!v && v.length > 0);
		return Array.from(new Set(values)).map((value) => ({ value, label: value }));
	}, [rowsForPartName]);

	const requestedByOptions = useMemo(() => {
		const values = rowsForRequestedBy
			.map((row) => row.requestedBy)
			.filter((value): value is string => !!value && value.trim().length > 0);
		return Array.from(new Set(values)).map((value) => ({ value, label: value }));
	}, [rowsForRequestedBy]);

	const departmentOptions = useMemo(() => {
		const values = rowsForDepartment
			.map((row) => row.requestedByDepartment)
			.filter((value): value is string => !!value && value.trim().length > 0);
		return Array.from(new Set(values)).map((value) => ({ value, label: value }));
	}, [rowsForDepartment]);

	const reasonOptions = useMemo(() => {
		const values = rowsForReason
			.map((row) => row.reason)
			.filter((value): value is string => !!value && value.trim().length > 0);
		return Array.from(new Set(values)).map((value) => ({
			value,
			label: getMaterialSelectionReasonLabel(value) ?? value,
		}));
	}, [rowsForReason]);

	const phaseOptions = useMemo(() => PHASE_OPTIONS.map((option) => ({ value: option, label: option })), []);
	const withAllOption = (options: { value: string; label: string }[]) => [
		{ value: ALL_VALUE, label: "All" },
		...options,
	];
	const jobNumberSelectOptions = useMemo(() => withAllOption(jobNumberOptions), [jobNumberOptions]);
	const jobNameSelectOptions = useMemo(() => withAllOption(jobNameOptions), [jobNameOptions]);
	const builderSelectOptions = useMemo(() => withAllOption(builderOptions), [builderOptions]);
	const projectSelectOptions = useMemo(() => withAllOption(projectOptions), [projectOptions]);
	const modelSelectOptions = useMemo(() => withAllOption(modelOptions), [modelOptions]);
	const departmentSelectOptions = useMemo(() => withAllOption(departmentOptions), [departmentOptions]);
	const reasonSelectOptions = useMemo(() => withAllOption(reasonOptions), [reasonOptions]);
	const phaseSelectOptions = useMemo(() => withAllOption(phaseOptions), [phaseOptions]);
	const partCodeSelectOptions = useMemo(() => withAllOption(partCodeOptions), [partCodeOptions]);
	const partNameSelectOptions = useMemo(() => withAllOption(partNameOptions), [partNameOptions]);
	const requestedBySelectOptions = useMemo(() => withAllOption(requestedByOptions), [requestedByOptions]);

	useEffect(() => {
		if (hasAppliedInitialView || !selectedView) {
			return;
		}

		if (filters.requestNumberFilter) {
			setHasAppliedInitialView(true);
			return;
		}

		onApplySavedView(selectedView.id, selectedView.filters);

		setHasAppliedInitialView(true);
	}, [selectedView, hasAppliedInitialView, onApplySavedView, filters.requestNumberFilter]);

	// Reset filter if the filtered value is no longer in available options
	useEffect(() => {
		if (!filters.jobFilter) return;
		const selected = filters.jobFilter.split("|").filter(Boolean);
		const valid = selected.filter((v) => jobNameOptions.some((opt) => opt.value === v));
		if (valid.length !== selected.length) {
			onFilterChange(MATERIAL_REQUEST_FILTER_TYPE.JOB_FILTER, valid.join("|"));
		}
	}, [filters.jobFilter, jobNameOptions, onFilterChange]);

	useEffect(() => {
		if (!filters.jobNumberFilter) return;
		const selected = filters.jobNumberFilter.split("|").filter(Boolean);
		const valid = selected.filter((v) => jobNumberOptions.some((opt) => opt.value === v));
		if (valid.length !== selected.length) {
			onFilterChange(MATERIAL_REQUEST_FILTER_TYPE.JOB_NUMBER_FILTER, valid.join("|"));
		}
	}, [filters.jobNumberFilter, jobNumberOptions, onFilterChange]);

	useEffect(() => {
		if (!filters.builderFilter) return;
		const selected = filters.builderFilter.split("|").filter(Boolean);
		const valid = selected.filter((v) => builderOptions.some((opt) => opt.value === v));
		if (valid.length !== selected.length) {
			onFilterChange(MATERIAL_REQUEST_FILTER_TYPE.BUILDER_FILTER, valid.join("|"));
		}
	}, [filters.builderFilter, builderOptions, onFilterChange]);

	useEffect(() => {
		if (!filters.projectFilter) return;
		const selected = filters.projectFilter.split("|").filter(Boolean);
		const valid = selected.filter((v) => projectOptions.some((opt) => opt.value === v));
		if (valid.length !== selected.length) {
			onFilterChange(MATERIAL_REQUEST_FILTER_TYPE.PROJECT_FILTER, valid.join("|"));
		}
	}, [filters.projectFilter, projectOptions, onFilterChange]);

	useEffect(() => {
		if (!filters.modelFilter) return;
		const selected = filters.modelFilter.split("|").filter(Boolean);
		const valid = selected.filter((v) => modelOptions.some((opt) => opt.value === v));
		if (valid.length !== selected.length) {
			onFilterChange(MATERIAL_REQUEST_FILTER_TYPE.MODEL_FILTER, valid.join("|"));
		}
	}, [filters.modelFilter, modelOptions, onFilterChange]);

	useEffect(() => {
		if (!filters.departmentFilter) return;
		const selected = filters.departmentFilter.split("|").filter(Boolean);
		const valid = selected.filter((v) => departmentOptions.some((opt) => opt.value === v));
		if (valid.length !== selected.length) {
			onFilterChange(MATERIAL_REQUEST_FILTER_TYPE.DEPARTMENT_FILTER, valid.join("|"));
		}
	}, [filters.departmentFilter, departmentOptions, onFilterChange]);

	useEffect(() => {
		const handleClick = () => {
			setContextMenu(null);
		};

		window.addEventListener("click", handleClick);

		return () => {
			window.removeEventListener("click", handleClick);
		};
	}, []);

	const hasActiveFilters = Object.entries(filters)
		.filter(([key]) => key !== "date")
		.some(([, value]) => !!value);

	const currentFilters = normalizeFilters(filters);

	const isMatchingExistingView = savedViews.some((view) => normalizeFilters(view.filters) === currentFilters);

	const isDefaultFilterState = !hasActiveFilters;

	const isSaveOrUpdateDisabled = isDefaultFilterState || isMatchingExistingView || (isAddingView && !viewName.trim());

	return (
		<div className="flex flex-col gap-3">
			{/* ── Row 1: filter dropdowns — horizontal scroll ─────────────────────── */}
			<div className="no-scrollbar overflow-x-auto py-0.5">
				<div className="flex min-w-max items-end gap-2">
					<div className="flex flex-col gap-0.5">
						<FilterSelectPopover
							label="Builder"
							value={filters.builderFilter}
							options={builderSelectOptions}
							onApply={(value) => onFilterChange(MATERIAL_REQUEST_FILTER_TYPE.BUILDER_FILTER, value)}
							triggerClassName="h-9 w-[160px]"
						/>
					</div>

					<div className="flex flex-col gap-0.5">
						<FilterSelectPopover
							label="Project"
							value={filters.projectFilter}
							options={projectSelectOptions}
							onApply={(value) => onFilterChange(MATERIAL_REQUEST_FILTER_TYPE.PROJECT_FILTER, value)}
							triggerClassName="h-9 w-[180px]"
						/>
					</div>
					<div className="flex flex-col gap-0.5">
						<FilterSelectPopover
							label="Job#"
							value={filters.jobNumberFilter}
							options={jobNumberSelectOptions}
							onApply={(value) => onFilterChange(MATERIAL_REQUEST_FILTER_TYPE.JOB_NUMBER_FILTER, value)}
							triggerClassName="h-9 w-[140px]"
						/>
					</div>

					<div className="flex flex-col gap-0.5">
						<FilterSelectPopover
							label="Job Name"
							value={filters.jobFilter}
							options={jobNameSelectOptions}
							onApply={(value) => onFilterChange(MATERIAL_REQUEST_FILTER_TYPE.JOB_FILTER, value)}
							triggerClassName="h-9 w-[180px]"
						/>
					</div>

					<div className="flex flex-col gap-0.5">
						<FilterSelectPopover
							label="Phase"
							value={filters.phaseFilter}
							options={phaseSelectOptions}
							onApply={(value) => onFilterChange(MATERIAL_REQUEST_FILTER_TYPE.PHASE_FILTER, value)}
							triggerClassName="h-9 w-[140px]"
						/>
					</div>

					<div className="flex flex-col gap-0.5">
						<FilterSelectPopover
							label="Part#"
							value={filters.partCodeFilter}
							options={partCodeSelectOptions}
							onApply={(value) => onFilterChange(MATERIAL_REQUEST_FILTER_TYPE.PART_CODE_FILTER, value)}
							triggerClassName="h-9 w-[160px]"
						/>
					</div>

					<div className="flex flex-col gap-0.5">
						<FilterSelectPopover
							label="Part Name"
							value={filters.partNameFilter}
							options={partNameSelectOptions}
							onApply={(value) => onFilterChange(MATERIAL_REQUEST_FILTER_TYPE.PART_NAME_FILTER, value)}
							triggerClassName="h-9 w-[180px]"
						/>
					</div>

					<div className="flex flex-col gap-0.5">
						<FilterSelectPopover
							label="Department"
							value={filters.departmentFilter}
							options={departmentSelectOptions}
							onApply={(value) => onFilterChange(MATERIAL_REQUEST_FILTER_TYPE.DEPARTMENT_FILTER, value)}
							triggerClassName="h-9 w-[140px]"
						/>
					</div>

					<div className="flex flex-col gap-0.5">
						<FilterSelectPopover
							label="Model"
							value={filters.modelFilter}
							options={modelSelectOptions}
							onApply={(value) => onFilterChange(MATERIAL_REQUEST_FILTER_TYPE.MODEL_FILTER, value)}
							triggerClassName="h-9 w-[120px]"
						/>
					</div>

					<div className="flex flex-col gap-0.5">
						<FilterSelectPopover
							label="Requested by"
							value={filters.requestedByFilter}
							options={requestedBySelectOptions}
							onApply={(value) => onFilterChange(MATERIAL_REQUEST_FILTER_TYPE.REQUESTED_BY_FILTER, value)}
							triggerClassName="h-9 w-[160px]"
						/>
					</div>

					<div className="flex flex-col gap-0.5">
						<FilterSelectPopover
							label="Reason"
							value={filters.reasonFilter}
							options={reasonSelectOptions}
							onApply={(value) => onFilterChange(MATERIAL_REQUEST_FILTER_TYPE.REASON_FILTER, value)}
							triggerClassName="h-9 w-[160px]"
						/>
					</div>

					<div className="flex flex-col gap-0.5">
						<div className="flex items-center gap-1">
							<DatePicker
								mode="range"
								selected={{
									from: startDate ?? undefined,
									to: endDate ?? undefined,
								}}
								onSelect={(value) => {
									if (!value?.from) {
										onDateRangeChange(null, null);
										return;
									}
									onDateRangeChange(value.from, value.to ?? null);
								}}
								required={false}
								className="!h-9 border border-brand-dark10 !bg-white text-xs shadow-none"
							/>
							{startDate && (
								<button
									type="button"
									onClick={() => onDateRangeChange(null, null)}
									className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-brand-dark50 transition-colors hover:bg-brand-bgLightgrey hover:text-brand-dark"
								>
									<X className="h-3.5 w-3.5" />
								</button>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* ── Row 2: mobile = single scrollable row | desktop = tabs left, actions right */}
			<div className="no-scrollbar overflow-x-auto py-0.5 sm:overflow-x-visible">
				<div className="flex min-w-max items-center gap-2 sm:min-w-0 sm:justify-between">
					{/* Left: view tabs */}
					<div className="flex items-center gap-2">
						{isForeman || showViewModeTabs ? (
							<>
								<Button
									variant={foremanViewMode === MATERIAL_REQUEST_VIEW_MODE.ALL && !selectedViewId ? "filled" : "outline"}
									className="h-8 rounded-[8px] px-3 text-xs"
									onClick={handleForemanDefaultViewClick}
								>
									All
								</Button>
								<Button
									variant={
										foremanViewMode === MATERIAL_REQUEST_VIEW_MODE.MY_REQUESTS && !selectedViewId ? "filled" : "outline"
									}
									className="h-8 rounded-[8px] px-3 text-xs"
									onClick={handleMyRequestsClick}
								>
									My Requests
								</Button>
							</>
						) : (
							<Button
								variant={!selectedViewId ? "filled" : "outline"}
								className="h-8 rounded-[8px] px-3 text-xs"
								onClick={handleDefaultViewClick}
							>
								All
							</Button>
						)}

						{savedViews.map((view) => (
							<Button
								key={view.id}
								variant={view.id === selectedViewId ? "filled" : "outline"}
								className="relative h-8 rounded-[8px] px-3 text-xs"
								onClick={() => handleSavedViewClick(view)}
								onContextMenu={(event) => {
									event.preventDefault();
									setContextMenu({ x: event.clientX, y: event.clientY, viewId: view.id });
								}}
								disabled={isUpdatingView || isDeletingView || isCreatingView}
							>
								<div className="flex items-center gap-1">
									{view?.isDefault && (
										<Image
											src="/assets/svg/star.svg"
											alt="star"
											width={13}
											height={13}
											className={view.id === selectedViewId ? "opacity-60 invert" : "opacity-40"}
										/>
									)}
									<span>{view.name}</span>
								</div>
							</Button>
						))}

						<Button
							variant="outline"
							className="h-8 rounded-[8px] px-3 text-xs"
							onClick={handlePlusIconClick}
							disabled={isAddingView || isDefaultFilterState || isMatchingExistingView}
						>
							<PlusIcon className="h-3 w-3" />
						</Button>

						{isAddingView && (
							<Input
								value={viewName}
								onChange={(e) => setViewName(e.target.value)}
								placeholder="Enter view name"
								className="h-8 w-full max-w-[220px]"
							/>
						)}
					</div>

					{/* Right: reset + save — separator only visible on mobile */}
					<div className="flex shrink-0 items-center gap-2">
						<span className="bg-brand-dark20 h-5 w-px sm:hidden" />
						<Button
							variant="outline"
							className="h-8 rounded-[8px] px-3 text-xs"
							onClick={isForeman ? handleForemanDefaultViewClick : handleDefaultViewClick}
						>
							Reset Filters
						</Button>
						<Button
							variant="filled"
							className="h-8 rounded-[8px] px-3 text-xs"
							onClick={
								isAddingView ? handleSaveViewClick : selectedViewId ? handleUpdateCurrentView : handleSaveViewClick
							}
							loading={isCreatingView || isUpdatingView}
							disabled={isSaveOrUpdateDisabled}
						>
							{isAddingView ? "Save View" : selectedViewId ? "Update View" : "Save View"}
						</Button>
					</div>
				</div>
			</div>

			{/* Context Menu */}
			{contextMenu && (
				<div
					className="fixed z-[9999] min-w-[140px] overflow-hidden rounded-[12px] border border-brand-dark10 bg-white shadow-md"
					style={{ top: contextMenu.y, left: contextMenu.x }}
				>
					<button
						className="hover:bg-brand-dark5 disabled:text-brand-dark40 flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
						onClick={() => handleSetDefault(contextMenu.viewId)}
						disabled={isUpdatingView || selectedContextView?.isDefault}
					>
						<Star className="h-3 w-3" />
						Favorite
					</button>

					<button
						className="hover:bg-brand-dark5 disabled:text-brand-dark40 flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
						onClick={() => handleRemoveDefault(contextMenu.viewId)}
						disabled={isUpdatingView || !selectedContextView?.isDefault}
					>
						<StarOff className="h-3 w-3" />
						Unfavorite
					</button>

					<button
						className="hover:bg-brand-dark5 disabled:text-brand-dark40 flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-500"
						onClick={() => handleDeleteView(contextMenu.viewId)}
						disabled={isDeletingView}
					>
						<Trash2 className="h-3 w-3" />
						Delete
					</button>
				</div>
			)}
		</div>
	);
};

export default MaterialRequestFilters;
