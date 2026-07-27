"use client";

import { IGeoTabZone } from "@/module/schedule-management/schedule-configuration/types/zone";
import { IMapEmployee, IMapProject, IVendor, MapTab } from "../types/zone";
import { buildAllTabItemId, MAP_TAB_COLOR, mapSubTabs } from "../utils/zone";
import ProjectSiteCard from "./project-site-card";
import EmployeeCard from "./employee-card";
import GeoZoneCard from "./geo-zone-card";
import VendorCard from "./vendor-card";

interface AllZonesListProps {
	jobSites: IMapProject[];
	employees: IMapEmployee[];
	officeZones: IGeoTabZone[];
	storageUnitZones: IGeoTabZone[];
	vendors: IVendor[];
	includedTabs: MapTab[];
	selectedId: string | number | null;
	onCardClick: (id: string) => void;
	cardRefsMap: React.MutableRefObject<Map<string | number, HTMLElement>>;
}

const SectionHeaderLabel = ({ tab }: { tab: MapTab }) => {
	const label = mapSubTabs.find((t) => t.value === tab)?.label ?? tab;
	return (
		<div className="flex items-center gap-1.5">
			<div className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: MAP_TAB_COLOR[tab] }} />
			<span className="text-xs font-semibold uppercase tracking-wide text-brand-grey">{label}</span>
		</div>
	);
};

const AllZonesList = ({
	jobSites,
	employees,
	officeZones,
	storageUnitZones,
	vendors,
	includedTabs,
	selectedId,
	onCardClick,
	cardRefsMap,
}: AllZonesListProps) => {
	const registerRef = (id: string) => (el: HTMLElement | null) => {
		if (el) cardRefsMap.current.set(id, el);
		else cardRefsMap.current.delete(id);
	};

	return (
		<div className="flex flex-col gap-5">
			{includedTabs.includes(MapTab.PROJECTS) && jobSites.length > 0 && (
				<div className="flex flex-col gap-3">
					<SectionHeaderLabel tab={MapTab.PROJECTS} />
					{jobSites.map((project) => {
						const id = buildAllTabItemId(MapTab.PROJECTS, project.recnum);
						return (
							<div key={id} ref={registerRef(id)}>
								<ProjectSiteCard project={project} isSelected={selectedId === id} onClick={() => onCardClick(id)} />
							</div>
						);
					})}
				</div>
			)}

			{includedTabs.includes(MapTab.EMPLOYEES) && employees.length > 0 && (
				<div className="flex flex-col gap-3">
					<SectionHeaderLabel tab={MapTab.EMPLOYEES} />
					{employees.map((employee, index) => {
						const id = buildAllTabItemId(MapTab.EMPLOYEES, employee?.id ?? index);
						return (
							<div key={id} ref={registerRef(id)}>
								<EmployeeCard employee={employee} isSelected={selectedId === id} onClick={() => onCardClick(id)} />
							</div>
						);
					})}
				</div>
			)}

			{includedTabs.includes(MapTab.OFFICE) && officeZones.length > 0 && (
				<div className="flex flex-col gap-3">
					<SectionHeaderLabel tab={MapTab.OFFICE} />
					{officeZones.map((zone) => {
						const id = buildAllTabItemId(MapTab.OFFICE, zone.id);
						return (
							<div key={id} ref={registerRef(id)}>
								<GeoZoneCard
									zone={zone}
									color={MAP_TAB_COLOR[MapTab.OFFICE]}
									isSelected={selectedId === id}
									onClick={() => onCardClick(id)}
								/>
							</div>
						);
					})}
				</div>
			)}

			{includedTabs.includes(MapTab.WHAREHOUSE) && storageUnitZones.length > 0 && (
				<div className="flex flex-col gap-3">
					<SectionHeaderLabel tab={MapTab.WHAREHOUSE} />
					{storageUnitZones.map((zone) => {
						const id = buildAllTabItemId(MapTab.WHAREHOUSE, zone.id);
						return (
							<div key={id} ref={registerRef(id)}>
								<GeoZoneCard
									zone={zone}
									color={MAP_TAB_COLOR[MapTab.WHAREHOUSE]}
									isSelected={selectedId === id}
									onClick={() => onCardClick(id)}
								/>
							</div>
						);
					})}
				</div>
			)}

			{includedTabs.includes(MapTab.VENDOR) && vendors.length > 0 && (
				<div className="flex flex-col gap-3">
					<SectionHeaderLabel tab={MapTab.VENDOR} />
					{vendors.map((vendor) => {
						const id = buildAllTabItemId(MapTab.VENDOR, vendor.id);
						return (
							<div key={id} ref={registerRef(id)}>
								<VendorCard vendor={vendor} isSelected={selectedId === id} onClick={() => onCardClick(id)} />
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default AllZonesList;
