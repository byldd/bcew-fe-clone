"use client";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/inputField";
import React, { useMemo, useState } from "react";
import { E_RE_ASSIGN_MODE, ISwitchJobModalProps } from "../types/schedule-interface";
import { useScheduleContext } from "../context/schedule-context";
import { SelectField } from "@/components/ui/selectField";
import { useReAssignEmployees } from "../hooks/useSchedule";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useQueryClient } from "@tanstack/react-query";
import { isPastDate } from "@/lib/utils/date";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const SwitchJobModal = ({ employee, dailyJob, bcewJob, onClose }: ISwitchJobModalProps) => {
	const { schduleData } = useScheduleContext();
	const [newDailyJobId, setNewDailyJobId] = useState<string | undefined>(undefined);
	const tjobCards = useTypedTranslations(NAMESPACE.JOB_CARDS);
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);
	const { mutate: switchJob } = useReAssignEmployees();
	const queryClient = useQueryClient();
	const jobs = useMemo(() => {
		return schduleData?.dailyJobs
			.filter((job) => job.id !== dailyJob.id)
			.filter((job) => !isPastDate(job.date))
			.map((dailyJob) => {
				const srvinvJob = schduleData?.bcewJobs.find((job) => job.srvinv?.idnum == dailyJob.bcewSrvinvIdNum)?.srvinv;
				const schlinJob = schduleData?.bcewJobs.find((job) => job.schlin?.idnum == dailyJob.bcewSchlinIdNum)?.schlin;

				const actrec = srvinvJob?.actrec || schlinJob?.actrec;
				return {
					value: dailyJob.id,
					label: `${actrec?.jobnme} (${srvinvJob?.ordnum || schlinJob?.tsknum}) ${new Date(dailyJob.date).toLocaleDateString()}`,
				};
			});
	}, [schduleData, dailyJob]);

	const handleSave = () => {
		if (!newDailyJobId) {
			return;
		}
		switchJob(
			{
				newDailyJobId: newDailyJobId,
				previousDailyJobId: dailyJob.id,
				employeeIds: [employee.employeeId!],
				mode: E_RE_ASSIGN_MODE.MOVE,
			},
			{
				onSuccess: () => {
					openSuccessToast(tjobCards.jobSwitchedSuccessfully);
					queryClient.invalidateQueries({ queryKey: ["week-schedule"] });
					onClose();
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	return (
		<div className="p-1">
			<div className="flex flex-col gap-4">
				<div className="flex-1">
					<InputField
						label={tschedule.currentJob}
						value={`${bcewJob?.schlin?.actrec.jobnme || bcewJob?.srvinv?.actrec.jobnme} (${bcewJob?.schlin?.tsknum || bcewJob?.srvinv?.ordnum})`}
						disabled
					/>
				</div>
				<div className="flex-1">
					<SelectField
						label={tschedule.newJob}
						options={jobs || []}
						onValueChange={(value) => setNewDailyJobId(value)}
						value={newDailyJobId}
						placeholder={tschedule.selectNewJob}
					/>
				</div>
			</div>
			<Button className="mt-4 w-full" variant={"filled"} onClick={handleSave}>
				{tCommon.save}
			</Button>
		</div>
	);
};

export default SwitchJobModal;
