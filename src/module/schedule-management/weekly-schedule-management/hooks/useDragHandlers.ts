import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { E_RE_ASSIGN_MODE, IWeekScheduleResponse } from "../types/schedule-interface";
import { useReAssignEmployees } from "./useSchedule";
import { emptyCardKey } from "../constants/week-schedule";

export function useDragHandlers(data: IWeekScheduleResponse | undefined) {
	const [activeDragWorker, setActiveDragWorker] = useState<
		IWeekScheduleResponse["dailyJobs"][number]["jobEmployeeAssignments"][number] | null
	>(null);

	const [dragSelectedWorkers, setDragSelectedWorkers] = useState<{
		workers: IWeekScheduleResponse["dailyJobs"][number]["jobEmployeeAssignments"][number][];
		jobId: string;
	}>({
		workers: [],
		jobId: "",
	});

	const { mutate: reAssignEmployees } = useReAssignEmployees();
	const queryClient = useQueryClient();
	const reAssignMode = useRef<E_RE_ASSIGN_MODE>(E_RE_ASSIGN_MODE.MOVE);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over) {
			setActiveDragWorker(null);
			return;
		}
		const previousDailyJobId = (active.id as string).split("_")[0] as string;
		const newDailyJobId = over.id as string;

		if (previousDailyJobId === newDailyJobId || !newDailyJobId || newDailyJobId.includes(emptyCardKey)) {
			setActiveDragWorker(null);
			return;
		}

		const employeeIds = dragSelectedWorkers.workers.map((w) => w.employeeId).filter((id) => id !== undefined);

		reAssignEmployees(
			{
				newDailyJobId,
				previousDailyJobId,
				employeeIds,
				mode: reAssignMode.current,
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ["week-schedule"] });
					openSuccessToast(
						reAssignMode.current === E_RE_ASSIGN_MODE.COPY
							? `${employeeIds.length === 1 ? "Employee" : "Employees"} copied successfully.`
							: `${employeeIds.length === 1 ? "Employee" : "Employees"} re-assigned successfully.`
					);
					setActiveDragWorker(null);
					setDragSelectedWorkers({ workers: [], jobId: "" });
					reAssignMode.current = E_RE_ASSIGN_MODE.MOVE;
				},
				onError: (error) => {
					reAssignMode.current = E_RE_ASSIGN_MODE.MOVE;

					openErrorToast({ error });
				},
			}
		);
	};

	const handleDragStart = (event: DragStartEvent) => {
		const { active } = event;
		const originJobId = (active.id as string).split("_")[0] as string;
		const employeeId = (active.id as string).split("_")[1] as string;

		const originJob = data?.dailyJobs?.find((dailyJob) => dailyJob.id === originJobId);
		const activeWorker = originJob?.jobEmployeeAssignments.find((jobEmployee) => jobEmployee.employeeId === employeeId);

		if (activeWorker) {
			setActiveDragWorker(activeWorker);
			if (dragSelectedWorkers.jobId !== originJobId) {
				setDragSelectedWorkers({ workers: [activeWorker], jobId: originJobId });
			} else if (!dragSelectedWorkers.workers.some((w) => w.employeeId === activeWorker.employeeId)) {
				setDragSelectedWorkers(() => ({
					workers: [activeWorker],
					jobId: originJobId,
				}));
			}
		}

		const activatorEvent = event.activatorEvent as KeyboardEvent | MouseEvent;
		reAssignMode.current =
			activatorEvent.metaKey || activatorEvent.ctrlKey ? E_RE_ASSIGN_MODE.COPY : E_RE_ASSIGN_MODE.MOVE;
	};

	const onSelectWorker = (
		worker: IWeekScheduleResponse["dailyJobs"][number]["jobEmployeeAssignments"][number],
		jobId: string
	) => {
		setDragSelectedWorkers((prev) => {
			if (prev.workers.length === 0 || prev.jobId !== jobId) {
				return { workers: [worker], jobId };
			}

			if (prev.workers.find((w) => w.employeeId === worker.employeeId)) {
				return {
					workers: prev.workers.filter((w) => w.employeeId !== worker.employeeId),
					jobId,
				};
			}

			return { workers: [...prev.workers, worker], jobId };
		});
	};

	return {
		handleDragStart,
		handleDragEnd,
		onSelectWorker,
		activeDragWorker,
		dragSelectedWorkers,
		setDragSelectedWorkers,
	};
}
