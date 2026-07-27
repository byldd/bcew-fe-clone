"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import SectionHeader from "@/components/shared/section-header";
import { cn } from "@/lib/utils/utils";
import { buildAllTabItemId, MAP_TAB_COLOR, mapTabs, mapSubTabValues } from "../utils/zone";
import { ITabMapMarker, MapTab } from "../types/zone";
import useMapParams from "../hooks/useMapParams";
import { useGetMapData } from "../hooks/useMap";
import { filterZones, useGetMapMarkers } from "../hooks/useMapMarker";
import TabMap from "../components/tab-map";
import ProjectsFilter from "../components/projects-filter";
import EmployeeFilter from "../components/employee-filter";
import AllZonesList from "../components/all-zones-list";
import { useGetGeoTabZones } from "@/module/schedule-management/schedule-configuration/hooks/useScheduleConfig";
import { useQcInspectionForman } from "@/module/schedule-management/weekly-schedule-management/hooks/useSchedule";
import useAuthStore from "@/store/auth-store";

const ProjectmMap = () => {
	const { getParams, setParams } = useMapParams();
	const { includedTabs } = getParams();

	const { user } = useAuthStore((s) => s);

	const [searchValue, setSearchValue] = useState("");
	const [selectedId, setSelectedId] = useState<string | number | null>(null);
	const [hoveredId, setHoveredId] = useState<string | number | null>(null);
	const [splitHeight, setSplitHeight] = useState<number>(600);
	const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

	// Hovering a pin focuses/scrolls the matching card without disturbing the click-based
	// selection (which also drives the map's pan/zoom) — hover wins the highlight when present.
	const activeId = hoveredId ?? selectedId;
	const isAllSelected = includedTabs.length === mapSubTabValues.length;
	// `includedTabs` is a fresh array on every render (it's read straight off the URL), so
	// memos key off this serialized form instead of risking a recompute on every render.
	const includedTabsKey = includedTabs.join(",");

	const splitRef = useRef<HTMLDivElement>(null);
	const cardRefsMap = useRef<Map<string | number, HTMLElement>>(new Map());
	// Remembers the tab selection that was active right before "All" was turned on, so turning
	// "All" back off restores it instead of collapsing to a single arbitrary tab.
	const preAllSelectionRef = useRef<MapTab[]>([]);

	useEffect(() => {
		if (!isAllSelected) {
			preAllSelectionRef.current = includedTabs;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [includedTabsKey, isAllSelected]);

	const { data: mapData, isLoading } = useGetMapData();
	const { data: inspectionForemans } = useQcInspectionForman();
	const { data: zones } = useGetGeoTabZones({ page: 1, pageSize: 1000 });

	const { officeZones, jobSites, employees, storageUnitZones, vendors } = useMemo(() => {
		return filterZones({
			mapData,
			inspectionForemans: inspectionForemans || [],
			zones: zones?.items || [],
			params: getParams(),
			search: searchValue,
		});
	}, [mapData, inspectionForemans, zones, getParams, searchValue]);

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
	}, [isLoading]);

	const { projectMarkers, employeeMarkers, officeMarkers, wharehouseMarkers, vendorMarkers } = useGetMapMarkers({
		jobSites,
		employees,
		offices: officeZones,
		wharehouses: storageUnitZones,
		vendors: vendors,
	});

	const activeMarkers = useMemo(() => {
		const tagMarkers = (markers: ITabMapMarker[], markerTab: MapTab) =>
			markers.map((marker) => ({
				...marker,
				id: buildAllTabItemId(markerTab, marker.id),
			}));

		return [
			...(includedTabs.includes(MapTab.PROJECTS) ? tagMarkers(projectMarkers, MapTab.PROJECTS) : []),
			...(includedTabs.includes(MapTab.EMPLOYEES) ? tagMarkers(employeeMarkers, MapTab.EMPLOYEES) : []),
			...(includedTabs.includes(MapTab.OFFICE) ? tagMarkers(officeMarkers, MapTab.OFFICE) : []),
			...(includedTabs.includes(MapTab.WHAREHOUSE) ? tagMarkers(wharehouseMarkers, MapTab.WHAREHOUSE) : []),
			...(includedTabs.includes(MapTab.VENDOR) ? tagMarkers(vendorMarkers, MapTab.VENDOR) : []),
		];
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [includedTabsKey, projectMarkers, employeeMarkers, officeMarkers, wharehouseMarkers, vendorMarkers]);

	const scrollCardIntoView = useCallback((id: string | number) => {
		const el = cardRefsMap.current.get(id);
		el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
	}, []);

	const handleMarkerClick = useCallback(
		(id: string | number) => {
			setSelectedId((prev) => (prev === id ? null : id));
			scrollCardIntoView(id);
		},
		[scrollCardIntoView]
	);

	const handleMarkerHover = useCallback(
		(id: string | number | null) => {
			setHoveredId(id);
			if (id !== null) scrollCardIntoView(id);
		},
		[scrollCardIntoView]
	);

	const handleCardClick = useCallback((id: string | number) => {
		setSelectedId((prev) => (prev === id ? null : id));
	}, []);

	const resetSelection = useCallback(() => {
		setSelectedId(null);
		setHoveredId(null);
		cardRefsMap.current.clear();
	}, []);

	const handleTabToggle = useCallback(
		(value: MapTab) => {
			const isSelected = includedTabs.includes(value);
			if (isSelected && includedTabs.length === 1) return; // always keep at least one tab selected

			const next = isSelected ? includedTabs.filter((t) => t !== value) : [...includedTabs, value];
			setParams({ includedTabs: next });
			resetSelection();
		},
		[includedTabs, setParams, resetSelection]
	);

	const handleAllToggle = useCallback(() => {
		const next = isAllSelected
			? preAllSelectionRef.current.length > 0
				? preAllSelectionRef.current
				: [MapTab.PROJECTS]
			: mapSubTabValues;
		setParams({ includedTabs: next });
		resetSelection();
	}, [isAllSelected, setParams, resetSelection]);

	const visibleTabs = mapTabs?.filter((tab) => {
		if (tab.value == MapTab.EMPLOYEES && user?.isAdmin) {
			return tab;
		} else {
			return tab;
		}
	});

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Spinner />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			<SectionHeader title="Project Map" />

			{/* ── Tabs left · Search + Filters right ──────────────── */}
			<div className="flex items-center justify-between gap-4">
				<div className="flex flex-wrap items-center gap-2">
					{visibleTabs.map((t) => {
						const isActive = t.value === MapTab.ALL ? isAllSelected : includedTabs.includes(t.value);
						return (
							<button
								key={t.value}
								type="button"
								onClick={() => (t.value === MapTab.ALL ? handleAllToggle() : handleTabToggle(t.value))}
								className={cn(
									"inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[8px] border border-brand-dark10 px-3 py-2 text-sm font-medium transition-all",
									isActive ? "bg-brand-dark text-white" : "bg-white text-brand-dark"
								)}
							>
								{t.value !== MapTab.ALL && (
									<span
										className="h-2 w-2 flex-shrink-0 rounded-full"
										style={{ backgroundColor: MAP_TAB_COLOR[t.value] }}
									/>
								)}
								{t.label}
							</button>
						);
					})}
				</div>

				<div className="flex flex-shrink-0 items-center gap-2">
					<div className="relative">
						<Input
							value={searchValue}
							onChange={(e) => setSearchValue(e.target.value)}
							placeholder={"Search.."}
							className="rounded-lg border-brand-gray p-2 text-sm focus-visible:ring-1"
						/>
					</div>

					{includedTabs.includes(MapTab.PROJECTS) && <ProjectsFilter />}
					{includedTabs.includes(MapTab.EMPLOYEES) && <EmployeeFilter />}
				</div>
			</div>

			{/* ── Split panel ───────────────────────────────────────── */}
			<div ref={splitRef} className="flex gap-2 overflow-hidden" style={{ height: splitHeight }}>
				{/* Left panel */}
				<div
					className="flex flex-shrink-0 flex-col overflow-hidden transition-[width] duration-300 ease-in-out"
					style={{ width: isPanelCollapsed ? 0 : 420 }}
				>
					<div className="flex h-full w-[420px] flex-shrink-0 flex-col overflow-hidden pr-2">
						<div className="flex flex-shrink-0 items-center justify-between pb-2">
							{selectedId !== null && (
								<button
									onClick={() => setSelectedId(null)}
									className="text-xs font-medium text-brand-grey underline-offset-2 hover:underline"
								>
									Clear selection
								</button>
							)}
						</div>

						<div className="flex-1 overflow-y-auto pr-1">
							<AllZonesList
								jobSites={jobSites}
								employees={employees}
								officeZones={officeZones}
								storageUnitZones={storageUnitZones}
								vendors={vendors}
								includedTabs={includedTabs}
								selectedId={activeId}
								onCardClick={handleCardClick}
								cardRefsMap={cardRefsMap}
							/>
						</div>
					</div>
				</div>

				{/* Collapse / expand toggle */}
				<button
					type="button"
					onClick={() => setIsPanelCollapsed((prev) => !prev)}
					aria-label={isPanelCollapsed ? "Expand panel" : "Collapse panel"}
					className="flex h-8 w-6 flex-shrink-0 items-center justify-center self-center rounded-full border border-brand-dark10 bg-white text-brand-dark shadow-sm hover:bg-brand-dark10"
				>
					{isPanelCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
				</button>

				{/* Right panel — map */}
				<div className="flex-1 overflow-hidden rounded-lg border border-grey-400">
					<TabMap
						markers={activeMarkers}
						selectedId={selectedId}
						onMarkerClick={handleMarkerClick}
						onMarkerHover={handleMarkerHover}
					/>
				</div>
			</div>
		</div>
	);
};

export default ProjectmMap;
