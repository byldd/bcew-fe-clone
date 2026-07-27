import { DataTable } from "@/components/shared/datatable/datatable";
import React from "react";
import { useGetPayrollLogs } from "../hooks/usePayrollLogs";
import { payRollLogColumns } from "../utils/payroll-logs-columns";
import { IGetPayRollLogsFilter } from "../types/payroll";

const PayrollLogsTable = ({ filters }: { filters: IGetPayRollLogsFilter }) => {
	const { data, isLoading } = useGetPayrollLogs(filters);

	return (
		<DataTable
			isLoading={isLoading}
			data={data || []}
			columns={payRollLogColumns}
			stickyHeaderMode
			useSectionHeader={false}
			showGridLines
		/>
	);
};

export default PayrollLogsTable;
