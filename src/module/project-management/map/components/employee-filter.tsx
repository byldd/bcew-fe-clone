import { SelectField } from "@/components/ui/selectField";
import useMapParams from "../hooks/useMapParams";
import React from "react";
import { EMPLOYEE_TYPE_OPTION } from "../types/zone";

const EmployeeFilter = () => {
	const { getParams, setParams } = useMapParams();
	const { employeeType } = getParams();

	const typeOptions = Object.values(EMPLOYEE_TYPE_OPTION).map((item) => {
		return {
			value: item,
			label: item,
		};
	});

	return (
		<div>
			<SelectField
				placeholder="Type"
				value={employeeType}
				options={typeOptions}
				onValueChange={(value) => {
					setParams({ employeeType: value as EMPLOYEE_TYPE_OPTION });
				}}
			/>
		</div>
	);
};

export default EmployeeFilter;
