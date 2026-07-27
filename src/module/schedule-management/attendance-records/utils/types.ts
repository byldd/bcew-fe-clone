import { ATTENDANCE_SOURCE, BCEW_ATTENDANCE_TYPE } from "./enums";

export interface IAttendanceRecord {
	id: string;
	source: ATTENDANCE_SOURCE;
	trans_dte: Date | string | null;
	empnum: number | null;
	employeeName: string | null;
	type: BCEW_ATTENDANCE_TYPE | null;
	sched_tme: Date | string | null;
	actual_tme: Date | string | null;
	new_strtme: Date | string | null;
	other_reason: string | null;
	comment: string | null;
	approved: number | null;
	approvedBy: string | null;
	notice_recvdby: string | null;
	notice_recvdfrm: string | null;
	submissiondte: Date | string | null;
	return_dte: Date | string | null;
	leave_time: Date | string | null;
	return_time: Date | string | null;
}

export type IAttendanceResponse = IAttendanceRecord[];
