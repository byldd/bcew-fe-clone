import React from "react";
import JobCard from "./job-card";
import { DroppableCardProps } from "../../types/schedule-interface";
import { useDroppable } from "@dnd-kit/core";
import { emptyCardKey } from "../../constants/week-schedule";

const DroppableCard = (props: DroppableCardProps) => {
	const { setNodeRef } = useDroppable({
		id: props.dailyJobWithEmployee?.id ?? `${props.bcewJob?.schlin?.idnum}_${props.day.date}_${emptyCardKey}`,
	});
	return (
		<div
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			ref={setNodeRef}
			className="h-full rounded-[8px] bg-white"
		>
			<JobCard {...props} />
		</div>
	);
};

export default DroppableCard;
