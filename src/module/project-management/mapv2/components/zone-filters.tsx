"use client";

import { useMemo } from "react";
import { SelectField } from "@/components/ui/selectField";
import { useQcInspectionForman } from "@/module/schedule-management/weekly-schedule-management/hooks/useSchedule";
import { EMPLOYEE_ZONE_FILTER, MAP_ZONE_TAB, PROJECT_ZONE_STATUS } from "../utils/enums";
import { IMapZoneParams } from "../hooks/useMapZoneParams";

interface ZoneFiltersProps {
	activeTabIds: string[];
	params: IMapZoneParams;
	setParams: (params: Partial<IMapZoneParams>) => void;
}

const employeeFilterOptions = [
	{ value: EMPLOYEE_ZONE_FILTER.ALL, label: "All Employees" },
	{ value: EMPLOYEE_ZONE_FILTER.FOREMAN, label: "Foreman" },
];

// Radix's SelectItem rejects an empty-string value, so the "clear this filter" option needs a
// non-empty sentinel instead - mapped back to `null` in the onValueChange handlers below.
const CLEAR_FILTER_VALUE = "__all__";

const projectStatusOptions = [
	{ value: CLEAR_FILTER_VALUE, label: "All Statuses" },
	{ value: PROJECT_ZONE_STATUS.IN_PROGRESS, label: "In Progress" },
	{ value: PROJECT_ZONE_STATUS.DO_NOT_CONTACT, label: "Do Not Contact" },
	{ value: PROJECT_ZONE_STATUS.COMPLETE, label: "Complete" },
	{ value: PROJECT_ZONE_STATUS.CLOSED, label: "Closed" },
];

// Each tab's own filter section is added independently below - both render together when both
// tabs are selected, and adding a third tab's filter later is just another `showXFilter` block.
const ZoneFilters = ({ activeTabIds, params, setParams }: ZoneFiltersProps) => {
	const showEmployeeFilter = activeTabIds.includes(MAP_ZONE_TAB.EMPLOYEE);
	const showProjectFilter = activeTabIds.includes(MAP_ZONE_TAB.PROJECT);

	const { data: inspectionForeman } = useQcInspectionForman();
	const foremanOptions = useMemo(() => {
		const foremen = (inspectionForeman ?? [])
			.filter((item) => item.deptManager?.employee?.bcewEmployeeNumber)
			.map((item) => ({
				value: item.deptManager.employee.bcewEmployeeNumber,
				label: item.deptManager.employee.user?.name ?? "",
			}));

		const uniqueForemen = foremen.filter(
			(item, index, self) => index === self.findIndex((other) => other.value === item.value)
		);

		return [{ value: CLEAR_FILTER_VALUE, label: "All Foremen" }, ...uniqueForemen];
	}, [inspectionForeman]);

	if (!showEmployeeFilter && !showProjectFilter) return null;

	return (
		<div className="flex flex-wrap items-center gap-3">
			{showEmployeeFilter && (
				<SelectField
					className="w-44"
					placeholder="Employee type"
					options={employeeFilterOptions}
					value={params.employeeFilter}
					onValueChange={(value) => setParams({ employeeFilter: value as EMPLOYEE_ZONE_FILTER })}
				/>
			)}

			{showProjectFilter && (
				<>
					<SelectField
						className="w-40"
						placeholder="Status"
						options={projectStatusOptions}
						value={params.projectStatus ?? CLEAR_FILTER_VALUE}
						onValueChange={(value) =>
							setParams({
								projectStatus: value === CLEAR_FILTER_VALUE ? null : (Number(value) as PROJECT_ZONE_STATUS),
							})
						}
					/>
					<SelectField
						className="w-48"
						placeholder="Foreman"
						options={foremanOptions}
						value={params.foremanEmpNum ?? CLEAR_FILTER_VALUE}
						onValueChange={(value) => setParams({ foremanEmpNum: value === CLEAR_FILTER_VALUE ? null : value })}
					/>
				</>
			)}
		</div>
	);
};

export default ZoneFilters;
