import { SelectField } from "@/components/ui/selectField";
import { JOB_STATUS_OPTIONS } from "@/module/builder-communication/types";
import { useQcInspectionForman } from "@/module/schedule-management/weekly-schedule-management/hooks/useSchedule";
import React from "react";
import useMapParams from "../hooks/useMapParams";
import { MultiSelect } from "@/components/ui/multi-select";

const ProjectsFilter = () => {
	const { getParams, setParams } = useMapParams();
	const { jobStatus, foremanEmpNums } = getParams();

	const statusOptions = JOB_STATUS_OPTIONS.map((status) => ({
		value: status,
		label: status,
	}));

	const { data: inspectionForeman } = useQcInspectionForman();
	const foremanOptions = inspectionForeman
		?.map((item) => ({
			id: String(item.deptManager.employee.bcewEmployeeNumber),
			name: item.deptManager.employee.user.name,
		}))
		.filter((item, index, self) => index === self.findIndex((t) => t.id === item.id));

	return (
		<div className="flex gap-4">
			{/* <SelectField
				value={jobStatus}
				placeholder="Status"
				options={statusOptions}
				onValueChange={(value) => {
					setParams({ jobStatus: value });
				}}
			/> */}

			<MultiSelect
				placeholder="Foreman"
				selected={
					foremanEmpNums?.map((value) => ({
						id: value,
						name: foremanOptions?.find((option) => option.id === value)?.name || "",
					})) || []
				}
				options={foremanOptions || []}
				onChange={(values) => {
					setParams({ foremanEmpNums: values.map((value) => value.id) });
				}}
				showSelected={false}
			/>
		</div>
	);
};

export default ProjectsFilter;
