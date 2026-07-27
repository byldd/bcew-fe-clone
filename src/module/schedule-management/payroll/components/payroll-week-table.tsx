"use client";
import { Card } from "@/components/ui/card";
import PayrollWeekCollapsibleTable from "./payroll-week-collapsible-table";

export default function PayrollWeekTable() {
	return (
		<Card className="w-full px-0 sm:px-2">
			<div className="no-scrollbar overflow-x-auto">
				<PayrollWeekCollapsibleTable />
			</div>
		</Card>
	);
}
