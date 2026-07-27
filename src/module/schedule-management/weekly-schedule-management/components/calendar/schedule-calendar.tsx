"use client";
import { closestCorners, DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { Spinner } from "@/components/ui/spinner";
import { isSameDate, toDate } from "@/lib/utils/date";
import { isClient } from "@/lib/utils/is-client";
import { SCHEDULE_ROW_TYPE } from "../../constants/week-schedule";
import { useScheduleContext } from "../../context/schedule-context";
import { useDragHandlers } from "../../hooks/useDragHandlers";
import { useScheduleParams } from "../../hooks/useScheduleParams";
import { getWeekStartAndEndForDate } from "../../utils";
import EmployeeDragLayer from "../employee-drag-layer";
import VirtualizedList from "./virtual-list";
import { WeekHeader } from "../week-header";
import RenderSpecialJob from "./render-special-job-row";
import RenderBcewJobRow from "./render-bcew-job-row";
import { QC_JOB_TYPE } from "../../types/schedule-interface";

const ScheduleCalendar = () => {
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		})
	);

	const { getParams } = useScheduleParams();
	const { startDate } = getParams();
	const { schduleData, isFetchingSchedule, dataOfWeek, search } = useScheduleContext();

	const searcForQCInspection =
		search && QC_JOB_TYPE.INSPECTION.toLocaleLowerCase().includes(search.toLocaleLowerCase());

	const calendarRef = useRef<HTMLDivElement>(null);

	const {
		handleDragStart,
		handleDragEnd,
		onSelectWorker,
		activeDragWorker,
		dragSelectedWorkers,
		setDragSelectedWorkers,
	} = useDragHandlers(schduleData);

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const { start: weekStartDate, end: weekEndDate } = getWeekStartAndEndForDate(startDate);

	const extendedjobsWithTypes =
		schduleData?.bcewJobs
			?.flatMap((bcewJob) => {
				if (bcewJob.schlinExtended) {
					const qcJobs = [];

					const repairJobSchedluedInCurrentWeek = bcewJob.schlinExtended?.qcrcmp
						? weekStartDate <= toDate(bcewJob.schlinExtended?.qcrcmp) &&
							weekEndDate >= toDate(bcewJob.schlinExtended?.qcrcmp)
						: false;

					if (
						schduleData?.dailyJobs?.some(
							(dailyJob) =>
								dailyJob?.qcType === QC_JOB_TYPE.INSPECTION &&
								dailyJob?.bcewSchlinExtendedId === bcewJob.schlinExtended?.id
						)
					) {
						qcJobs.push({ rowType: SCHEDULE_ROW_TYPE.QC_INSPECTION, bcewJob });
					}

					if (
						!searcForQCInspection &&
						bcewJob?.schlinExtended?.qcrcmp &&
						(dataOfWeek?.some(
							(day) => bcewJob?.schlinExtended?.qcrcmp && isSameDate(day.date, bcewJob.schlinExtended.qcrcmp)
						) ||
							schduleData?.dailyJobs?.some(
								(dailyJob) =>
									dailyJob?.qcType === QC_JOB_TYPE.REPAIR &&
									dailyJob?.bcewSchlinExtendedId === bcewJob.schlinExtended?.id
							) ||
							repairJobSchedluedInCurrentWeek)
					) {
						qcJobs.push({ rowType: SCHEDULE_ROW_TYPE.QC_REPAIR, bcewJob });
					}
					return [...qcJobs];
				}

				const bcewJobStartDate = bcewJob?.schlin?.fxddte || bcewJob?.srvinv?.schdte;
				let isCarryOver = false;
				if (bcewJobStartDate) {
					isCarryOver = new Date(bcewJobStartDate) < weekStartDate;
				}

				return [{ rowType: SCHEDULE_ROW_TYPE.DAILY_JOB, bcewJob, isCarryOver }];
			})
			.flat() || [];

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
				if (dragSelectedWorkers?.workers?.length > 0) {
					setDragSelectedWorkers({
						workers: [],
						jobId: "",
					});
				}
			}
		}

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [dragSelectedWorkers, setDragSelectedWorkers]);

	if (isFetchingSchedule) {
		return <Spinner show />;
	}

	return (
		<div
			ref={calendarRef}
			onClick={() => {
				if (dragSelectedWorkers?.workers?.length > 0) {
					setDragSelectedWorkers({
						workers: [],
						jobId: "",
					});
				}
			}}
		>
			<DndContext
				sensors={sensors}
				onDragEnd={handleDragEnd}
				onDragStart={handleDragStart}
				collisionDetection={closestCorners}
			>
				<VirtualizedList
					bcewJobs={extendedjobsWithTypes}
					renderHeader={<WeekHeader datesOfWeek={dataOfWeek.map((day) => day.date)} />}
					specialJobs={schduleData?.specialJobs || []}
					renderBcewJobRow={(item) => {
						return (
							<RenderBcewJobRow
								dataOfWeek={dataOfWeek}
								onSelectWorker={onSelectWorker}
								dragSelectedWorkers={dragSelectedWorkers}
								schduleData={schduleData}
								setDragSelectedWorkers={setDragSelectedWorkers}
								jobItem={item}
							/>
						);
					}}
					renderSpecialJob={(specialJob) => {
						return (
							<RenderSpecialJob
								dataOfWeek={dataOfWeek}
								specialJob={specialJob}
								onSelectWorker={onSelectWorker}
								dragSelectedWorkers={dragSelectedWorkers}
								schduleData={schduleData}
								setDragSelectedWorkers={setDragSelectedWorkers}
							/>
						);
					}}
				/>

				{createPortal(
					<EmployeeDragLayer activeDragWorker={activeDragWorker} selectedWorkers={dragSelectedWorkers} />,
					isClient ? document.body : document.createElement("div")
				)}
			</DndContext>
		</div>
	);
};

export default ScheduleCalendar;
