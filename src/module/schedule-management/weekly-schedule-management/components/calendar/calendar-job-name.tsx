import React from "react";
import { bcewJobCardId, JOB_PHASE_LABEL, SCHEDULE_ROW_TYPE } from "../../constants/week-schedule";

import { IWeekScheduleResponse } from "../../types/schedule-interface";
import { routes } from "@/config/routes";
import { AppTooltip } from "@/components/ui/tooltip";
import { formatJobSiteName } from "../../utils/job-card";
import { cn } from "@/lib/utils/utils";
import { PiClockUserLight } from "react-icons/pi";
import { usePopover } from "@/hooks/usePopover";
import TaskLeaderPopover from "./task-leader-popover";

const CalendarJobName = ({
	rowType,
	bcewJob,
	specialJob,
	isCarryOver,
	taskLeaders,
}: {
	rowType: SCHEDULE_ROW_TYPE;
	bcewJob?: IWeekScheduleResponse["bcewJobs"][0];
	specialJob?: IWeekScheduleResponse["specialJobs"][0];
	isCarryOver?: boolean;
	taskLeaders?: IWeekScheduleResponse["jobTaskLeaders"];
}) => {
	const { openPopover, Popover } = usePopover();

	const naviagateToFiledFiles = () => {
		const recnum = bcewJob?.schlin?.recnum || bcewJob?.srvinv?.actrec.recnum || bcewJob?.schlinExtended?.actrec.recnum;
		if (!recnum) return;

		window.open(routes.bcew.fieldFiles(recnum!), "_blank");
	};

	const navigateToWordOrder = () => {
		const recnum = bcewJob?.srvinv?.recnum;
		if (recnum) {
			window.open(routes.bcew.workOrder(recnum), "_blank");
		}
	};

	const actrec = bcewJob?.schlin?.actrec || bcewJob?.srvinv?.actrec || bcewJob?.schlinExtended?.actrec;

	const { name = "", number = "" } = formatJobSiteName(actrec?.jobnme || "");

	const onClickTaskLeaders = () => {
		openPopover({
			popoverView: <TaskLeaderPopover taskLeaders={taskLeaders} />,
		});
	};

	return (
		<div
			id={bcewJobCardId(bcewJob?.schlin?.idnum || bcewJob?.srvinv?.idnum || String(bcewJob?.schlinExtended?.id))}
			className={cn(
				"relative flex h-full min-h-[100px] w-full flex-col justify-center rounded-[8px] border bg-white p-4 text-center text-xs font-semibold text-brand-dark",
				isCarryOver && "border border-brand-red"
			)}
		>
			<div className="absolute right-1 top-1">
				<Popover />
				{rowType !== SCHEDULE_ROW_TYPE.SPECIAL_JOB && <PiClockUserLight onClick={onClickTaskLeaders} />}
			</div>
			<div
				className={cn(
					"absolute -left-5 top-1/2 -translate-y-1/2 flex-col items-center rounded-md border bg-white px-1 py-1.5 text-center",
					isCarryOver && "border border-brand-red"
				)}
			>
				<AppTooltip text="Estimated Hours" label="EH" labelClassName="text-brand-dark font-bold" />
				<span className="text-[10px] font-bold leading-none">
					{bcewJob?.schlin?.bdglin?.hrsbdg || bcewJob?.srvinv?.bdglin?.hrsbdg || "NA"}
				</span>
			</div>
			{rowType === SCHEDULE_ROW_TYPE.SPECIAL_JOB && specialJob ? (
				<SpecialJobName specialJob={specialJob} />
			) : (
				<>
					<div
						onClick={naviagateToFiledFiles}
						className="cursor-pointer whitespace-normal break-words text-center font-bold text-brand-dark"
						title={actrec?.jobnme}
					>
						<p>{name}</p>
						<p>{number}</p>
						{bcewJob?.schlin?.multiFamily && (
							<AppTooltip
								trigger={
									<div className="flex items-center justify-center">
										<p className="cursor-pointer text-xs text-brand-dark80 underline">see more</p>
									</div>
								}
								text={
									<div className="max-w-[400px]">
										<ul>
											{bcewJob?.schlin?.multiFamily?.split(",")?.map((item) => (
												<li key={item}>{item}</li>
											))}
										</ul>
									</div>
								}
								label="MF"
							/>
						)}
					</div>
					<div className="break-words text-brand-dark50">Job #{actrec?.recnum} </div>
					<div className="mb-2 text-brand-dark50">
						{!actrec?.weeklySchedulesSrvinv ? (
							<p>
								(
								{bcewJob?.schlin?.tsknme ||
									bcewJob?.srvinv?.ordnum ||
									(bcewJob?.schlinExtended?.tsknum ? JOB_PHASE_LABEL[bcewJob?.schlinExtended?.tsknum] : "")}
								) {rowType === SCHEDULE_ROW_TYPE.QC_REPAIR && `(QC Repair)`}
								{rowType === SCHEDULE_ROW_TYPE.QC_INSPECTION && `(QC Inspection)`}
							</p>
						) : (
							<p onClick={navigateToWordOrder} className="cursor-pointer hover:underline">
								{actrec?.weeklySchedulesSrvinv?.typnme?.split(" ")[0]} - {actrec?.weeklySchedulesSrvinv?.tsknme}
							</p>
						)}
					</div>
				</>
			)}
		</div>
	);
};

export default CalendarJobName;

const SpecialJobName = ({ specialJob }: { specialJob: IWeekScheduleResponse["specialJobs"][0] }) => {
	return <div className="capitalize">{specialJob.name}</div>;
};
