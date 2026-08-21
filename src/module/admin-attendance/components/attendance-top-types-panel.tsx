"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DASHBOARD_PERIOD, DASHBOARD_PERIOD_LABEL } from "../enums";
import { IAttendanceTopType } from "../types";
import { ATTENDANCE_CHART_BAR_COLORS } from "../utils/constants";

const AttendanceTopTypesPanel = ({ topTypes }: { topTypes: IAttendanceTopType[] }) => {
	const [period, setPeriod] = useState<DASHBOARD_PERIOD>(DASHBOARD_PERIOD.YESTERDAY);
	const maxCount = Math.max(1, ...topTypes.map((type) => type.count));

	return (
		<div className="flex flex-col gap-5 rounded-[12px] border border-brand-dark10 bg-white p-5">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-medium text-brand-dark50">Top Types</h3>
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

			<div className="flex flex-col gap-4">
				{topTypes.map((type, index) => (
					<div key={type.label} className="flex flex-col gap-2">
						<div className="flex items-center justify-between text-xs">
							<span className="font-medium text-brand-dark50">{type.label}</span>
							<span className="font-medium text-brand-dark">{type.count}</span>
						</div>
						<div className="h-2 w-full overflow-hidden rounded-full bg-brand-bgLightgrey">
							<div
								className="h-full rounded-full"
								style={{
									width: `${(type.count / maxCount) * 100}%`,
									backgroundColor: ATTENDANCE_CHART_BAR_COLORS[index % ATTENDANCE_CHART_BAR_COLORS.length],
								}}
								role="img"
								aria-label={`${type.label}: ${type.count}`}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default AttendanceTopTypesPanel;
