import React from "react";
import { IJobTaskLeader } from "../../types/schedule-interface";
import { JOB_PHASE_LABEL_NUM } from "../../constants/week-schedule";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const TaskLeaderList = ({ taskLeaders }: { taskLeaders: IJobTaskLeader[] }) => {
	const tSchedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	const serviceTaskLeader = taskLeaders?.find((leader) => leader.TaskNum === JOB_PHASE_LABEL_NUM["Service"]);
	const roughTaskLeader = taskLeaders?.find((leader) => leader.TaskNum === JOB_PHASE_LABEL_NUM["Rough"]);
	const finalTaskLeader = taskLeaders?.find((leader) => leader.TaskNum === JOB_PHASE_LABEL_NUM["Final"]);
	const secondHitTaskLeader = taskLeaders?.find((leader) => leader.TaskNum === JOB_PHASE_LABEL_NUM["Second hit"]);

	const Pending = <p className="text-brand-grey">{tSchedule.pending}</p>;

	return (
		<div className="flex w-full flex-col gap-2">
			<div className="flex justify-between">
				<p className="text-brand-grey">{tEmployee.phase}</p>
				<p className="text-brand-grey">{tEmployee.crewLeader}</p>
			</div>
			<div className="flex justify-between">
				<p className="text-brand-grey">{tEmployee.service}</p>
				{serviceTaskLeader?.TaskLeaderName ? <p>{serviceTaskLeader?.TaskLeaderName}</p> : Pending}
			</div>
			<div className="flex justify-between">
				<p className="text-brand-grey">{tEmployee.rough}</p>
				{roughTaskLeader?.TaskLeaderName ? <p>{roughTaskLeader?.TaskLeaderName}</p> : Pending}
			</div>
			<div className="flex justify-between">
				<p className="text-brand-grey">{tEmployee.final}</p>
				{finalTaskLeader?.TaskLeaderName ? <p>{finalTaskLeader?.TaskLeaderName}</p> : Pending}
			</div>
			{secondHitTaskLeader && (
				<div className="flex justify-between">
					<p className="text-brand-grey">{tEmployee.secondHit}</p>
					{secondHitTaskLeader?.TaskLeaderName ? <p>{secondHitTaskLeader?.TaskLeaderName}</p> : Pending}
				</div>
			)}
		</div>
	);
};

export default TaskLeaderList;
