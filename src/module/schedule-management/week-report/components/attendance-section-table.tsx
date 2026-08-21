import { IAttendanceRecord } from "@/module/schedule-management/attendance-records/utils/types";
import { attendanceTypeLabelMap } from "@/module/schedule-management/attendance-records/utils";
import { ATTENDANCE_SOURCE } from "@/module/schedule-management/attendance-records/utils/enums";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { SectionTableHead, SectionTableCell } from "./table-components";

const AttendanceSectionTable = ({ attendances }: { attendances: IAttendanceRecord[] }) => {
	if (attendances.length === 0) {
		return <p className="px-1 py-2 text-xs text-brand-dark50">No attendance records</p>;
	}

	return (
		<table className="w-full min-w-max border-collapse">
			<thead>
				<tr className="bg-brand-bgLightgrey">
					<SectionTableHead>Source</SectionTableHead>
					<SectionTableHead>Attendance Date</SectionTableHead>
					<SectionTableHead>Submission Date</SectionTableHead>
					<SectionTableHead>Type</SectionTableHead>
					<SectionTableHead>Scheduled Time</SectionTableHead>
					<SectionTableHead>Actual Time</SectionTableHead>
					<SectionTableHead>Reason</SectionTableHead>
					<SectionTableHead>Comment</SectionTableHead>
					<SectionTableHead>Approved</SectionTableHead>
					<SectionTableHead>Approved By</SectionTableHead>
				</tr>
			</thead>
			<tbody>
				{attendances.map((attendance) => (
					<tr key={attendance.id}>
						<SectionTableCell>{attendance.source === ATTENDANCE_SOURCE.BYLDD ? "Byldd" : "BCEW"}</SectionTableCell>
						<SectionTableCell>
							{attendance.trans_dte ? toFormattedDate(attendance.trans_dte, DATE_FORMAT.MM_SLASH_DD_YYYY) : "-"}
						</SectionTableCell>
						<SectionTableCell>
							{attendance.submissiondte ? toFormattedDate(attendance.submissiondte, DATE_FORMAT.MM_SLASH_DD_YYYY) : "-"}
						</SectionTableCell>
						<SectionTableCell>{attendance.type ? attendanceTypeLabelMap[attendance.type] : "-"}</SectionTableCell>
						<SectionTableCell>
							{attendance.sched_tme ? toFormattedDate(attendance.sched_tme, DATE_FORMAT.HH_MM_AA_PM) : "-"}
						</SectionTableCell>
						<SectionTableCell>
							{attendance.actual_tme ? toFormattedDate(attendance.actual_tme, DATE_FORMAT.HH_MM_AA_PM) : "-"}
						</SectionTableCell>
						<SectionTableCell>{attendance.other_reason ?? "-"}</SectionTableCell>
						<SectionTableCell>{attendance.comment ?? "-"}</SectionTableCell>
						<SectionTableCell>
							{attendance.approved === null ? "-" : attendance.approved ? "Yes" : "No"}
						</SectionTableCell>
						<SectionTableCell>{attendance.approvedBy ?? "-"}</SectionTableCell>
					</tr>
				))}
			</tbody>
		</table>
	);
};

export default AttendanceSectionTable;
