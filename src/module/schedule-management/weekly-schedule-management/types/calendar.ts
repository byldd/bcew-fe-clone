import { SCHEDULE_ROW_TYPE } from "../constants/week-schedule";
import { ISpecialJob } from "./schedule-configuration";
import { IWeekScheduleResponse } from "./schedule-interface";

export type ICalendarWeekData = {
	date: Date;
	type: string;
	time: string | Date | undefined;
};

export type IVirtualizedListProps = {
	bcewJobs: IRenderBcewJobRowProps["jobItem"][];
	renderBcewJobRow: (item: IRenderBcewJobRowProps["jobItem"], index: number) => React.ReactNode;
	renderHeader?: React.ReactNode;
	specialJobs: IWeekScheduleResponse["specialJobs"];
	renderSpecialJob: (specialJob: IWeekScheduleResponse["specialJobs"][number], index: number) => React.ReactNode;
};

export type IRenderSpecialJobRowProps = {
	dataOfWeek: ICalendarWeekData[];
	specialJob: ISpecialJob;
	onSelectWorker: (
		workers: IWeekScheduleResponse["dailyJobs"][number]["jobEmployeeAssignments"][number],
		jobId: string
	) => void;
	dragSelectedWorkers: {
		workers: IWeekScheduleResponse["dailyJobs"][number]["jobEmployeeAssignments"][number][];
		jobId: string;
	};
	schduleData: IWeekScheduleResponse | undefined;
	setDragSelectedWorkers: (workers: {
		workers: IWeekScheduleResponse["dailyJobs"][number]["jobEmployeeAssignments"][number][];
		jobId: string;
	}) => void;
};

export type IRenderBcewJobRowProps = Pick<
	IRenderSpecialJobRowProps,
	"dataOfWeek" | "onSelectWorker" | "dragSelectedWorkers" | "schduleData" | "setDragSelectedWorkers"
> & {
	jobItem: {
		bcewJob: IWeekScheduleResponse["bcewJobs"][number];
		rowType: SCHEDULE_ROW_TYPE;
		isCarryOver?: boolean;
	};
};

export type IScheduleCalendarDate = {
	date: Date;
	type: string;
	time: string | undefined;
};
