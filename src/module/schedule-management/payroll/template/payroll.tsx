"use client";
import SectionHeader from "@/components/shared/section-header";

import React from "react";

import AddPayrollLog from "../components/add-payroll-log";

import PayrollWeekTable from "../components/payroll-week-table";
import { DatePicker } from "@/components/ui/date-picker";
import { toDate, toMidnightDateString } from "@/lib/utils/date";
import { usePayRollParams } from "../hooks/usePayrollParams";

const Payroll = () => {
	const { getParams, setParams } = usePayRollParams();
	const { startDate, endDate } = getParams();

	return (
		<div className="w-full space-y-6 bg-white">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<SectionHeader title={"Payroll Logs"} hideSidebarToggle={false} />

				<div className="no-scrollbar overflow-x-auto">
					<div className="flex min-w-max items-center gap-3 py-1">
						<DatePicker
							mode={"range"}
							selected={{
								from: toDate(startDate),
								to: toDate(endDate),
							}}
							onSelect={(value) => {
								setParams({
									startDate: value?.from ? toMidnightDateString(value?.from) : startDate,
									endDate: value?.to ? toMidnightDateString(value?.to) : endDate,
								});
							}}
							key="date-picker"
							required={false}
						/>
						<AddPayrollLog />
					</div>
				</div>
			</div>

			<PayrollWeekTable />
		</div>
	);
};

export default Payroll;
