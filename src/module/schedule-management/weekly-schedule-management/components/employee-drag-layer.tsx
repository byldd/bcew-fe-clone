import { DragOverlay } from "@dnd-kit/core";
import React from "react";
import { IWeekScheduleResponse } from "../types/schedule-interface";

export default function EMployeeDragLayer({
	selectedWorkers,
	activeDragWorker,
}: {
	selectedWorkers: {
		workers: IWeekScheduleResponse["dailyJobs"][number]["jobEmployeeAssignments"][number][];
		jobId: string;
	};
	activeDragWorker: IWeekScheduleResponse["dailyJobs"][number]["jobEmployeeAssignments"][number] | null;
}) {
	return (
		<DragOverlay>
			{activeDragWorker ? (
				<div className="z-50 flex flex-col gap-1">
					<div className="border-1 flex w-full items-center justify-center border border-gray-200 px-1 py-1 text-start text-xs font-normal shadow-xl">
						<p className="text-xs">Drag and replace</p>
					</div>
					{selectedWorkers.workers.map((worker) => (
						<div
							key={worker.employeeId}
							className="flex w-full items-center justify-between px-1 py-1 text-start text-xs font-normal shadow-xl"
						>
							<p className="text-xs">{worker.employee?.user?.name}</p>
						</div>
					))}
				</div>
			) : null}
		</DragOverlay>
	);
}
