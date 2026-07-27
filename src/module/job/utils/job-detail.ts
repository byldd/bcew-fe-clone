import { getTodayDate, isSameDate } from "@/lib/utils/date";
import {
	IDailyJob,
	IJobEmployeeAssignment,
	QC_JOB_TYPE,
} from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { handlePastFutureDateOperations } from "../utils";

export const getEmployeeAssignmentForJob = (currentJob: IDailyJob | undefined, assignmentId: string | undefined) => {
	return currentJob?.jobEmployeeAssignments?.find((jobEmployee) => jobEmployee?.id === assignmentId);
};

export const isEditDisabledForJob = ({
	currentJob,
	currentAssignment,
	startDate,
	dayEndTime,
}: {
	currentJob: IDailyJob | undefined;
	currentAssignment: IJobEmployeeAssignment | undefined;
	startDate: Date | string | undefined;
	dayEndTime: Date | string | undefined;
}) => {
	return (
		!currentJob ||
		handlePastFutureDateOperations(currentJob.date, startDate, dayEndTime, !currentAssignment?.startTime, true)
	);
};

export const shouldShowRescheduleAction = (currentJob: IDailyJob | undefined) => {
	if (!currentJob?.date) {
		return false;
	}

	return currentJob.qcType === QC_JOB_TYPE.INSPECTION && isSameDate(new Date(currentJob.date), getTodayDate());
};
