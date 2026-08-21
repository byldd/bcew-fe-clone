"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DASHBOARD_PERIOD, DASHBOARD_PERIOD_LABEL } from "../enums";
import { IAttendanceSummaryItem } from "../types";

const AttendanceSummaryPanel = ({ title, items }: { title: string; items: IAttendanceSummaryItem[] }) => {
	const [period, setPeriod] = useState<DASHBOARD_PERIOD>(DASHBOARD_PERIOD.YESTERDAY);

	return (
		<div className="flex flex-col gap-5 rounded-[12px] border border-brand-dark10 bg-white p-5">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-medium text-brand-dark50">{title}</h3>
				<Select value={period} onValueChange={(value) => setPeriod(value as DASHBOARD_PERIOD)}>
					<SelectTrigger className="h-8 w-[110px] text-xs">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{Object.values(DASHBOARD_PERIOD).map((value) => (
							<SelectItem key={value} value={value}>
								{DASHBOARD_PERIOD_LABEL[value]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<ul className="divide-y divide-brand-dark10">
				{items.map((item) => (
					<li key={item.label} className="flex items-center justify-between py-2 text-sm">
						<span className="font-medium text-brand-dark50">{item.label}</span>
						<span className="font-medium text-brand-dark">{item.points} points</span>
					</li>
				))}
			</ul>
		</div>
	);
};

export default AttendanceSummaryPanel;
