import React from "react";
import { IWeekScheduleResponse } from "../../types/schedule-interface";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import TaskLeaderList from "./task-leader-list";

const TaskLeaderPopover = ({ taskLeaders }: { taskLeaders?: IWeekScheduleResponse["jobTaskLeaders"] }) => {
	const tSchedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	return (
		<div className="w-[300px] p-3">
			<p className="py-3 text-brand-grey">{tSchedule.crewLeaderDetails}</p>
			<TaskLeaderList taskLeaders={taskLeaders || []} />
		</div>
	);
};

export default TaskLeaderPopover;
