import { useSidebar } from "@/components/ui/sidebar";
import React from "react";
import { ICalendarWeekData } from "../../types/calendar";

const CalenderRowLayout = ({
	dataOfWeek,
	children,
}: {
	dataOfWeek: ICalendarWeekData[];
	children: React.ReactNode;
}) => {
	const { open } = useSidebar();

	return (
		<div
			className="mx-5 grid gap-1"
			style={{
				gridTemplateColumns: `${open ? "170px" : "210px"} repeat(${dataOfWeek.length}, minmax(170px, auto))`,
			}}
		>
			{children}
		</div>
	);
};

export default CalenderRowLayout;
