"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import SectionHeader from "@/components/shared/section-header";
import { cn } from "@/lib/utils/utils";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useModal } from "@/hooks/useModal";
import ConfirmModal from "@/components/confirm-modal";
import { useDebounce } from "@/hooks/useDebounce";
import useMapZoneParams from "../hooks/useMapZoneParams";
import { useGetAccessibleMapZoneTabs } from "../hooks/useMapZoneTabs";
import { useDeleteMapZone, useGetMapZones } from "../hooks/useMapZones";
import { IGetMapZone } from "../types/zone";
import ZoneMap from "../components/zone-map";
import ZoneList from "../components/zone-list";
import ZoneFormModal from "../components/zone-form-modal";
import ZoneFilters from "../components/zone-filters";
import TabManager from "../components/tab-manager";
import ZoneTypeManager from "../components/zone-type-manager";
import ProjectZoneTable from "../components/project-zone-table";
import WriteAccessWrapper from "@/module/admin/components/write-access-wrapper";
import { MODULE } from "@/utils/enums";
import { MAP_VIEW_MODE, MAP_ZONE_TAB, MAP_ZONE_TYPE } from "../utils/enums";

const ProjectMapPage = () => {
	const { getParams, setParams } = useMapZoneParams();
	const { tabIds, searchValue, employeeFilter, projectStatus, foremanEmpNum } = getParams();
	const queryClient = useQueryClient();

	const [viewMode, setViewMode] = useState<MAP_VIEW_MODE>(MAP_VIEW_MODE.MAP);
	const [searchInput, setSearchInput] = useState(searchValue);
	const debouncedSearch = useDebounce(searchInput);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
	const [splitHeight, setSplitHeight] = useState(600);

	const splitRef = useRef<HTMLDivElement>(null);
	const cardRefsMap = useRef<Map<string, HTMLElement>>(new Map());

	const { Modal: ZoneModal, openModal: openZoneModal, closeModal: closeZoneModal } = useModal();
	const { Modal: TabsModal, openModal: openTabsModal } = useModal();
	const { Modal: ZoneTypeModal, openModal: openZoneTypeModal } = useModal();
	const { Modal: ConfirmDeleteModal, openModal: openConfirmModal, closeModal: closeConfirmModal } = useModal();

	useEffect(() => {
		setParams({ searchValue: debouncedSearch });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedSearch]);

	const { data: tabs, isLoading: isLoadingTabs } = useGetAccessibleMapZoneTabs();

	// Remembers the tab selection that was active right before "All" was turned on, so turning
	// "All" back off restores it instead of collapsing to a single arbitrary tab.
	const preAllSelectionRef = useRef<string[]>([]);

	const allTabIds = useMemo(() => (tabs ?? []).map((tab) => tab.id), [tabs]);
	const activeTabIds = tabIds.length > 0 ? tabIds : tabs?.[0] ? [tabs[0].id] : [];
	const isAllSelected = allTabIds.length > 0 && activeTabIds.length === allTabIds.length;
	// `activeTabIds` is a fresh array on every render, so memos/effects key off this serialized
	// form instead of risking a recompute on every render.
	const activeTabIdsKey = activeTabIds.join(",");

	useEffect(() => {
		if (!isAllSelected) {
			preAllSelectionRef.current = activeTabIds;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeTabIdsKey, isAllSelected]);

	const { data: zoneData, isLoading: isLoadingZones } = useGetMapZones({
		searchValue: searchValue || undefined,
		employeeFilter,
		projectStatuses: projectStatus ? [projectStatus] : undefined,
		foremanEmpNum: foremanEmpNum ? Number(foremanEmpNum) : undefined,
		page: 1,
		pageSize: 1000,
	});

	const zones = useMemo(() => {
		const items = zoneData?.items ?? [];
		if (isAllSelected) return items;
		return items.filter((zone) => {
			const zoneTabId = zone.mapZoneType?.mapZoneTab?.id;
			return zoneTabId ? activeTabIds.includes(zoneTabId) : false;
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [zoneData, activeTabIdsKey, isAllSelected]);

	const { mutate: deleteZone } = useDeleteMapZone();

	// The Project table view is a separate top-level screen, not a filtered version of the tab
	// bar/map - only offered when the viewer's role has access to the Projects tab at all.
	const projectTab = useMemo(() => (tabs ?? []).find((tab) => tab.id === MAP_ZONE_TAB.PROJECT), [tabs]);
	const projectZones = useMemo(
		() => (zoneData?.items ?? []).filter((zone) => zone.mapZoneType?.id === MAP_ZONE_TYPE.PROJECT),
		[zoneData]
	);
	const isTableView = viewMode === MAP_VIEW_MODE.TABLE && Boolean(projectTab);

	useEffect(() => {
		const BOTTOM_PADDING = 24;
		const update = () => {
			if (!splitRef.current) return;
			const { top } = splitRef.current.getBoundingClientRect();
			setSplitHeight(window.innerHeight - top - BOTTOM_PADDING);
		};
		const raf = requestAnimationFrame(update);
		window.addEventListener("resize", update);
		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("resize", update);
		};
	}, []);

	const scrollCardIntoView = useCallback((id: string) => {
		cardRefsMap.current.get(id)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
	}, []);

	const handleZoneClick = useCallback(
		(id: string) => {
			setSelectedId((prev) => (prev === id ? null : id));
			scrollCardIntoView(id);
		},
		[scrollCardIntoView]
	);

	const handleTabToggle = (id: string) => {
		const isSelected = activeTabIds.includes(id);
		if (isSelected && activeTabIds.length === 1) return; // always keep at least one tab selected

		const next = isSelected ? activeTabIds.filter((t) => t !== id) : [...activeTabIds, id];
		setParams({ tabIds: next });
		setSelectedId(null);
	};

	const handleAllToggle = () => {
		const next = isAllSelected
			? preAllSelectionRef.current.length > 0
				? preAllSelectionRef.current
				: tabs?.[0]
					? [tabs[0].id]
					: []
			: allTabIds;
		setParams({ tabIds: next });
		setSelectedId(null);
	};

	const handleCreateZone = () => {
		const tabId = isTableView ? MAP_ZONE_TAB.PROJECT : (activeTabIds[0] ?? undefined);
		openZoneModal({
			modalTitle: "Create Zone",
			modalView: <ZoneFormModal tabId={tabId} onClose={closeZoneModal} />,
			variant: "big",
		});
	};

	const handleEditZone = (zone: IGetMapZone) => {
		openZoneModal({
			modalTitle: "Edit Zone",
			modalView: <ZoneFormModal zone={zone} onClose={closeZoneModal} />,
			variant: "big",
		});
	};

	const handleDeleteZone = (zone: IGetMapZone) => {
		openConfirmModal({
			modalTitle: "Delete Zone",
			modalView: (
				<ConfirmModal
					description={`Delete zone "${zone.name}"?`}
					confirmText="Delete"
					onCancel={closeConfirmModal}
					onConfirm={() => {
						closeConfirmModal();
						deleteZone(zone.id, {
							onSuccess: () => {
								openSuccessToast("Zone deleted successfully.");
								void queryClient.invalidateQueries({ queryKey: ["map-zones"] });
							},
							onError: (error) => openErrorToast({ error }),
						});
					}}
				/>
			),
		});
	};

	const handleManageTabs = () => {
		openTabsModal({ modalTitle: "Manage Tabs", modalView: <TabManager />, variant: "medium" });
	};

	const handleManageTypes = () => {
		openZoneTypeModal({ modalTitle: "Manage Zone Types", modalView: <ZoneTypeManager />, variant: "medium" });
	};

	if (isLoadingTabs) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if ((tabs ?? []).length === 0) {
		return (
			<div className="flex flex-col gap-3">
				<SectionHeader title="Project Map" />
				<Card className="flex h-64 items-center justify-center border-dashed shadow-none">
					<CardContent className="flex flex-col items-center justify-center text-center">
						<p className="text-base font-medium text-brand-dark50">No map tabs available</p>
						<p className="mt-2 text-sm text-brand-dark30">
							Your role doesn&apos;t have access to any map tabs. Contact an administrator to get access.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="flex justify-between">
				<SectionHeader title="Project Map" />

				<div className="flex items-center gap-3">
					{projectTab && (
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setViewMode(isTableView ? MAP_VIEW_MODE.MAP : MAP_VIEW_MODE.TABLE)}
						>
							{isTableView ? "Map View" : "Project Table"}
						</Button>
					)}
					<WriteAccessWrapper moduleName={MODULE.WEEKLY_SCHEDULE}>
						<Button type="button" variant="outline" size="sm" onClick={handleManageTabs}>
							Manage Tabs
						</Button>
						<Button type="button" variant="outline" size="sm" onClick={handleManageTypes}>
							Manage Types
						</Button>
					</WriteAccessWrapper>
				</div>
			</div>

			{isTableView ? (
				<>
					<div className="flex items-center justify-end gap-2">
						<Input
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							placeholder="Search projects"
							className="rounded-lg border-brand-gray p-2 text-sm focus-visible:ring-1"
						/>
						<WriteAccessWrapper moduleName={MODULE.WEEKLY_SCHEDULE}>
							<Button type="button" variant="filled" onClick={handleCreateZone}>
								<Plus size={14} className="mr-1" />
								Create Zone
							</Button>
						</WriteAccessWrapper>
					</div>

					<ProjectZoneTable
						zones={projectZones}
						isLoading={isLoadingZones}
						onEdit={handleEditZone}
						onDelete={handleDeleteZone}
					/>
				</>
			) : (
				<>
					<div className="flex items-center justify-between gap-4">
						<div className="flex flex-wrap items-center gap-2">
							<button
								type="button"
								onClick={handleAllToggle}
								className={cn(
									"inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[8px] border border-brand-dark10 px-3 py-2 text-sm font-medium transition-all",
									isAllSelected ? "bg-brand-dark text-white" : "bg-white text-brand-dark"
								)}
							>
								All
							</button>
							{(tabs ?? []).map((tab) => (
								<button
									key={tab.id}
									type="button"
									onClick={() => handleTabToggle(tab.id)}
									className={cn(
										"inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[8px] border border-brand-dark10 px-3 py-2 text-sm font-medium transition-all",
										activeTabIds.includes(tab.id) ? "bg-brand-dark text-white" : "bg-white text-brand-dark"
									)}
								>
									{tab.name}
								</button>
							))}
						</div>

						<div className="flex flex-shrink-0 items-center gap-2">
							<Input
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
								placeholder="Search zones"
								className="rounded-lg border-brand-gray p-2 text-sm focus-visible:ring-1"
							/>
							<WriteAccessWrapper moduleName={MODULE.WEEKLY_SCHEDULE}>
								<Button type="button" variant="filled" onClick={handleCreateZone}>
									<Plus size={14} className="mr-1" />
									Create Zone
								</Button>
							</WriteAccessWrapper>
						</div>
					</div>

					<ZoneFilters activeTabIds={activeTabIds} params={getParams()} setParams={setParams} />

					<div ref={splitRef} className="flex gap-2 overflow-hidden" style={{ height: splitHeight }}>
						<div
							className="flex flex-shrink-0 flex-col overflow-hidden transition-[width] duration-300 ease-in-out"
							style={{ width: isPanelCollapsed ? 0 : 420 }}
						>
							<div className="flex h-full w-[420px] flex-shrink-0 flex-col overflow-hidden pr-2">
								<div className="flex-1 overflow-y-auto pr-1">
									<ZoneList
										zones={zones}
										isLoading={isLoadingZones}
										selectedId={selectedId}
										onCardClick={handleZoneClick}
										onEdit={handleEditZone}
										onDelete={handleDeleteZone}
										cardRefsMap={cardRefsMap}
									/>
								</div>
							</div>
						</div>

						<button
							type="button"
							onClick={() => setIsPanelCollapsed((prev) => !prev)}
							aria-label={isPanelCollapsed ? "Expand panel" : "Collapse panel"}
							className="flex h-8 w-6 flex-shrink-0 items-center justify-center self-center rounded-full border border-brand-dark10 bg-white text-brand-dark shadow-sm hover:bg-brand-dark10"
						>
							{isPanelCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
						</button>

						<div className="flex-1 overflow-hidden rounded-lg border border-grey-400">
							<ZoneMap zones={zones} selectedId={selectedId} onZoneClick={handleZoneClick} />
						</div>
					</div>
				</>
			)}

			<ZoneModal />
			<TabsModal />
			<ZoneTypeModal />
			<ConfirmDeleteModal />
		</div>
	);
};

export default ProjectMapPage;
