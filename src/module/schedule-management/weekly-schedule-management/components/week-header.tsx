"use client";

import React from "react";

import { cn } from "@/lib/utils/utils";
import { getDateInfo } from "../utils/date";
import { useSidebar } from "@/components/ui/sidebar";
import { useScheduleParams } from "../hooks/useScheduleParams";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";

interface WeekHeaderProps {
	datesOfWeek: Date[];
	containerClassName?: string;
	dateClassName?: string;
}

export const WeekHeader: React.FC<WeekHeaderProps> = ({ datesOfWeek, containerClassName, dateClassName }) => {
	const { getParams } = useScheduleParams();
	const { pdf } = getParams();

	const { open } = useSidebar();
	return (
		<div
			className={cn("mb-4 grid items-start gap-2 bg-brand-bgLightgrey50", containerClassName)}
			style={{
				gridTemplateColumns: `${open ? "170px" : "200px"} repeat(${datesOfWeek.length}, minmax(170px, 1fr))`,
			}}
		>
			<div className="min-w-[170px]" />
			{datesOfWeek.map((date, idx) => {
				const { dayNum, dayName, isToday } = getDateInfo(date);
				return (
					<div
						//IMPORTANT: This id is used in BE to identify the days in the calendar, so we can set range of generated pdf.
						// keep this is same and date format as in BE.
						id={`schedule-calendar-day-${toFormattedDate(date, DATE_FORMAT.YYYY_MM_DD)}`}
						key={idx}
						className={cn(
							"relative flex items-center justify-center gap-1 text-center text-xs font-semibold",
							{
								"!font-bold text-brand-dark": isToday && !pdf,
								"text-brand-dark50": !isToday || pdf,
							},
							dateClassName
						)}
					>
						<span className="text-center">{dayNum}</span>|<span className="text-center">{dayName}</span>
					</div>
				);
			})}
		</div>
	);
};
