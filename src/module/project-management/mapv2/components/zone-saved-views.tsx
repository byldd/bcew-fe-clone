"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { PlusIcon, Star, StarOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { FILTER_SAVED_VIEW_PAGE_KEY } from "@/utils/enums";
import {
	useCreateMapZoneSavedView,
	useDeleteMapZoneSavedView,
	useMapZoneSavedViews,
	useUpdateMapZoneSavedView,
} from "../hooks/useMapZoneSavedViews";
import { IMapZoneParams } from "../hooks/useMapZoneParams";
import { DEFAULT_MAP_ZONE_PARAMS, hasActiveMapZoneFilters, normalizeMapZoneFilters } from "../utils/saved-view";

interface ZoneSavedViewsProps {
	params: IMapZoneParams;
	setParams: (params: Partial<IMapZoneParams>) => void;
}

const ZoneSavedViews = ({ params, setParams }: ZoneSavedViewsProps) => {
	const [hasAppliedInitialView, setHasAppliedInitialView] = useState(false);
	const [isAddingView, setIsAddingView] = useState(false);
	const [viewName, setViewName] = useState("");
	const [contextMenu, setContextMenu] = useState<{ x: number; y: number; viewId: string } | null>(null);

	const { data: savedViewsData } = useMapZoneSavedViews();
	const savedViews = savedViewsData?.items ?? [];
	const selectedView = savedViews.find((view) => view.isLastViewed) ?? null;
	const selectedViewId = selectedView?.id ?? null;

	const { mutate: createView, isPending: isCreatingView } = useCreateMapZoneSavedView();
	const { mutate: updateView, isPending: isUpdatingView } = useUpdateMapZoneSavedView();
	const { mutate: deleteView, isPending: isDeletingView } = useDeleteMapZoneSavedView();

	const selectedContextView = savedViews.find((view) => view.id === contextMenu?.viewId);

	const handlePlusIconClick = () => {
		if (isAddingView) return;
		setIsAddingView(true);
		setViewName("");
	};

	const handleSaveViewClick = () => {
		const trimmedName = viewName.trim();
		if (!trimmedName) {
			openErrorToast({ message: "Please enter a view name" });
			return;
		}

		createView(
			{ name: trimmedName, pageKey: FILTER_SAVED_VIEW_PAGE_KEY.PROJECT_MAP, filters: params, isLastViewed: true },
			{
				onSuccess: (view) => {
					openSuccessToast(`${view?.name} created.`);
					setIsAddingView(false);
					setViewName("");
				},
				onError: (error) => openErrorToast({ error }),
			}
		);
	};

	const handleResetClick = () => {
		setParams(DEFAULT_MAP_ZONE_PARAMS);
		if (!selectedViewId) return;
		updateView(
			{ viewId: selectedViewId, payload: { isLastViewed: false } },
			{ onError: (error) => openErrorToast({ error }) }
		);
	};

	const handleSavedViewClick = (view: (typeof savedViews)[number]) => {
		setParams(view.filters);
		updateView({ viewId: view.id, payload: { isLastViewed: true } }, { onError: (error) => openErrorToast({ error }) });
	};

	const handleUpdateCurrentView = () => {
		if (!selectedViewId) return;
		updateView(
			{ viewId: selectedViewId, payload: { filters: params } },
			{
				onSuccess: () => openSuccessToast("View updated."),
				onError: (error) => openErrorToast({ error }),
			}
		);
	};

	const handleSetDefault = (viewId: string) => {
		updateView(
			{ viewId, payload: { isDefault: true } },
			{
				onSuccess: () => {
					openSuccessToast("Favorite view created.");
					setContextMenu(null);
				},
				onError: (error) => openErrorToast({ error }),
			}
		);
	};

	const handleRemoveDefault = (viewId: string) => {
		updateView(
			{ viewId, payload: { isDefault: false } },
			{
				onSuccess: () => {
					openSuccessToast("Favorite removed.");
					setContextMenu(null);
				},
				onError: (error) => openErrorToast({ error }),
			}
		);
	};

	const handleDeleteView = (viewId: string) => {
		const isDeletingSelectedView = selectedViewId === viewId;
		deleteView(viewId, {
			onSuccess: () => {
				if (isDeletingSelectedView) setParams(DEFAULT_MAP_ZONE_PARAMS);
				openSuccessToast("View deleted.");
				setContextMenu(null);
			},
			onError: (error) => openErrorToast({ error }),
		});
	};

	// Re-apply whichever view was last viewed, so the filter state persists across visits - same as
	// the material-requests saved-views pattern.
	useEffect(() => {
		if (hasAppliedInitialView || !selectedView) return;
		setParams(selectedView.filters);
		setHasAppliedInitialView(true);
	}, [selectedView, hasAppliedInitialView, setParams]);

	useEffect(() => {
		const handleClick = () => setContextMenu(null);
		window.addEventListener("click", handleClick);
		return () => window.removeEventListener("click", handleClick);
	}, []);

	const currentFiltersKey = normalizeMapZoneFilters(params);
	const isMatchingExistingView = savedViews.some((view) => normalizeMapZoneFilters(view.filters) === currentFiltersKey);
	const isDefaultFilterState = !hasActiveMapZoneFilters(params);
	const isSaveOrUpdateDisabled = isDefaultFilterState || isMatchingExistingView || (isAddingView && !viewName.trim());

	return (
		<div className="flex flex-wrap justify-between">
			<div className="flex items-center gap-2">
				<Button
					variant={!selectedViewId ? "filled" : "outline"}
					className="h-8 rounded-[8px] px-3 text-xs"
					onClick={handleResetClick}
				>
					All
				</Button>

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
							{view.isDefault && (
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

			<div className="flex items-center gap-2">
				<Button variant="outline" className="h-8 rounded-[8px] px-3 text-xs" onClick={handleResetClick}>
					Reset Filters
				</Button>

				{(isAddingView || selectedViewId) && (
					<Button
						variant="filled"
						className="h-8 rounded-[8px] px-3 text-xs"
						onClick={isAddingView ? handleSaveViewClick : handleUpdateCurrentView}
						loading={isCreatingView || isUpdatingView}
						disabled={isSaveOrUpdateDisabled}
					>
						{isAddingView ? "Save View" : "Update View"}
					</Button>
				)}
			</div>

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

export default ZoneSavedViews;
