import { IAttendanceRecord } from "../../attendance-records/utils/types";
import { ATTENDANCE_SOURCE } from "../../attendance-records/utils/enums";
import { attendanceTypeLabelMap } from "../../attendance-records/utils";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";

const TimeVarianceAttendanceRecords = ({ attendanceRecords }: { attendanceRecords: IAttendanceRecord[] }) => {
	return (
		<div className="max-h-[320px] w-[min(280px,calc(100vw-2rem))] divide-y overflow-y-auto rounded-[10px] border bg-white p-2 shadow-sm">
			<p className="mb-1 text-sm font-medium text-brand-dark">Attendance Requests</p>
			{attendanceRecords.map((record) => (
				<div key={record.id} className="space-y-1 p-3 text-xs">
					<div className="flex items-center justify-between">
						<span className="font-medium text-brand-dark">
							{record.source === ATTENDANCE_SOURCE.BYLDD ? "Byldd" : "BCEW"}
						</span>
						<span className="text-brand-grey">{record.approved ? "Approved" : "Not Approved"}</span>
					</div>

					<p className="text-sm font-medium text-brand-dark">
						{record.type ? attendanceTypeLabelMap[record.type] : "-"}
					</p>

					{record.sched_tme && record.actual_tme && (
						<div>
							<p className="text-brand-grey">
								Scheduled time:{" "}
								{record.sched_tme ? toFormattedDate(record.sched_tme, DATE_FORMAT.HH_MM_AA_PM) : "-"}{" "}
							</p>
							<p className="text-brand-grey">
								Actual Time: {record.actual_tme ? toFormattedDate(record.actual_tme, DATE_FORMAT.HH_MM_AA_PM) : "-"}
							</p>
						</div>
					)}

					{(record.other_reason || record.comment) && (
						<div>
							<p>Note</p>
							<p className="text-brand-grey">{record.other_reason || record.comment}</p>
						</div>
					)}

					{record.approvedBy && <p className="text-brand-grey">Approved by {record.approvedBy}</p>}
				</div>
			))}
		</div>
	);
};

export default TimeVarianceAttendanceRecords;
