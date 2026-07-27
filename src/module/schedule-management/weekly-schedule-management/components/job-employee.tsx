import React from "react";
import { JobEmployeeProps } from "../types/schedule-interface";
import { cn } from "@/lib/utils/utils";
import { useDraggable } from "@dnd-kit/core";
import { usePopover } from "@/hooks/usePopover";
import CrewPopover from "./crew-popover";
import { RxDragHandleDots2 } from "react-icons/rx";
import { ACCESS_LEVEL } from "@/module/employee/enums";
import { useScheduleContext } from "../context/schedule-context";
import { calculateStopHours } from "../../time-logs-management/utils/calculate-hours";
import { toDate, toMidnightDateString } from "@/lib/utils/date";

const JobEmployee = ({
	employee,
	onSelectWorker,
	dailyJobWithEmployee,
	dragSelectedWorkers,
	bcewJob,
	isPastDate,
	specialJob,
}: JobEmployeeProps) => {
	const isSelected = dragSelectedWorkers.workers.find(
		(worker) => worker.employeeId === employee.employeeId && dragSelectedWorkers.jobId === dailyJobWithEmployee!.id
	);
	const { attributes, listeners, setNodeRef } = useDraggable({
		id: `${dailyJobWithEmployee!.id}_${employee.employeeId}`,
	});

	const { accessLevel, employeeDayTimesLookup } = useScheduleContext();
	const dateKey = toMidnightDateString(toDate(dailyJobWithEmployee!.date));
	const employeeId = employee.employeeId!;

	const employeeDayTime = employeeDayTimesLookup[dateKey]?.[employeeId];

	const { openPopover, Popover, closePopover } = usePopover();

	const stopHour = calculateStopHours({
		stop: {
			startTime: employee?.startTime ?? undefined,
			endTime: employee?.endTime ?? undefined,
			overrideStartTime: employee?.overrideStartTime ?? undefined,
			overrideEndTime: employee?.overrideEndTime ?? undefined,
		},
		employeePauseTime: employeeDayTime?.employeePauseTime ?? undefined,
	});

	const handleRightClickCrew = (e: React.MouseEvent) => {
		if (accessLevel !== ACCESS_LEVEL.WRITE || isPastDate || dailyJobWithEmployee?.isQcJob) {
			return;
		}
		if (dailyJobWithEmployee?.isQcJob) return;
		e.preventDefault();
		e.stopPropagation();

		openPopover({
			popoverView: (
				<CrewPopover
					dailyJob={dailyJobWithEmployee}
					employee={employee}
					bcewJob={bcewJob}
					dragSelectedWorkers={dragSelectedWorkers}
					onClose={closePopover}
					specialJob={specialJob}
				/>
			),
		});
	};

	return (
		<div
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			ref={accessLevel === ACCESS_LEVEL.WRITE ? setNodeRef : undefined}
			{...(accessLevel === ACCESS_LEVEL.WRITE ? attributes : {})}
			{...(accessLevel === ACCESS_LEVEL.WRITE ? listeners : {})}
			onClick={(e) => {
				if (accessLevel !== ACCESS_LEVEL.WRITE) {
					return;
				}
				e.stopPropagation();
				if (e.ctrlKey || e.metaKey) {
					onSelectWorker(employee, dailyJobWithEmployee!.id);
				}
			}}
			onContextMenu={handleRightClickCrew}
			className={cn(
				"flex w-full items-center justify-between p-1 text-start text-[10px] font-normal",
				isSelected && "rounded-sm p-1 shadow-[0px_4.34px_11.93px_0px_#00000040] hover:cursor-grab"
			)}
		>
			<Popover />
			{isSelected && <RxDragHandleDots2 className="!m-0" />}
			<p className="!m-0 line-clamp-1">{employee?.employee?.user?.name}</p>

			<div className="flex gap-3">
				<p className="!m-0 w-[22px] text-right text-[8px] text-brand-dark">
					{typeof stopHour === "number" ? `${stopHour}H` : ""}
				</p>

				<p className="!m-0 w-[18px] text-right text-[8px] text-brand-dark">
					{typeof employee?.stopNumber === "number" ? `S ${employee.stopNumber}` : ""}
				</p>
			</div>
		</div>
	);
};

export default JobEmployee;
