import { ColumnDef } from "@tanstack/react-table";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import {
	ATTENDANCE_APPROVAL_STATUS,
	ATTENDANCE_APPROVAL_STATUS_LABEL,
	ATTENDANCE_REASON_LABEL,
	EMPLOYMENT_STATUS_LABEL,
	WORKSITE_TYPE_LABEL,
} from "../enums";
import { IAttendancePendingApproval } from "../types";
import AttendanceReviewAction from "../components/attendance-review-action";

const PTO_STATUS_BADGE_CLASS: Record<ATTENDANCE_APPROVAL_STATUS, string> = {
	[ATTENDANCE_APPROVAL_STATUS.PENDING]: "bg-brand-bgYellow text-brand-yellow800",
	[ATTENDANCE_APPROVAL_STATUS.APPROVED]: "bg-brand-green100 text-brand-green800",
	[ATTENDANCE_APPROVAL_STATUS.DECLINED]: "bg-brand-red100 text-brand-red800",
};

export const attendancePendingApprovalColumns: ColumnDef<IAttendancePendingApproval>[] = [
	{
		header: "Request ID",
		accessorKey: "requestId",
	},
	{
		header: "Employee",
		cell: ({ row }) => row.original.user.name,
	},
	{
		header: "Status",
		cell: ({ row }) => EMPLOYMENT_STATUS_LABEL[row.original.employmentStatus],
	},
	{
		header: "Employee Type",
		cell: ({ row }) => WORKSITE_TYPE_LABEL[row.original.worksiteType],
	},
	{
		header: "Reason",
		cell: ({ row }) => ATTENDANCE_REASON_LABEL[row.original.reason],
	},
	{
		header: "Note",
		accessorKey: "note",
	},
	{
		header: "Schedule Time",
		cell: ({ row }) =>
			row.original.scheduledTime ? toFormattedDate(row.original.scheduledTime, DATE_FORMAT.HH_MM_AA_PM) : "--",
	},
	{
		header: "Actual Time",
		cell: ({ row }) =>
			row.original.actualTime ? toFormattedDate(row.original.actualTime, DATE_FORMAT.HH_MM_AA_PM) : "--",
	},
	{
		header: "Submission Date",
		cell: ({ row }) => toFormattedDate(row.original.submissionDate, DATE_FORMAT.MM_SLASH_DD_YYYY),
	},
	{
		header: "Requested Time Off",
		accessorKey: "requestedTimeOffRange",
	},
	{
		header: "PTO Status",
		cell: ({ row }) => (
			<span
				className={`rounded-full px-2 py-0.5 text-xs font-medium ${PTO_STATUS_BADGE_CLASS[row.original.ptoStatus]}`}
			>
				{ATTENDANCE_APPROVAL_STATUS_LABEL[row.original.ptoStatus]}
			</span>
		),
	},
	{
		header: "Action",
		cell: ({ row }) => <AttendanceReviewAction approval={row.original} />,
	},
];
