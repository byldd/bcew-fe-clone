// utils/attendance-columns.tsx

"use client";

import { ColumnDef } from "@tanstack/react-table";

import { IAttendanceRecord } from "./types";

import { ATTENDANCE_SOURCE } from "./enums";

import { toFormattedDate } from "@/lib/utils/date";

import { DATE_FORMAT } from "@/types/date";
import { attendanceTypeLabelMap } from ".";
import { AppTooltip } from "@/components/ui/tooltip";

export const useAttendanceColumns = () => {
	const columns: ColumnDef<IAttendanceRecord>[] = [
		{
			accessorKey: "employeeName",

			header: "Employee Name",

			cell: ({ row }) => {
				return <div className="font-medium">{row.original.employeeName ?? "-"}</div>;
			},
		},

		{
			accessorKey: "source",
			header: "Source",

			cell: ({ row }) => {
				const source = row.original.source;

				return <div className="font-medium">{source === ATTENDANCE_SOURCE.BYLDD ? "Byldd" : "BCEW"}</div>;
			},
		},

		{
			accessorKey: "trans_dte",
			header: "Attendance Date",

			cell: ({ row }) => {
				const transDate = row.original.trans_dte;

				return transDate ? toFormattedDate(transDate, DATE_FORMAT.MM_SLASH_DD_YYYY) : "-";
			},
		},

		{
			accessorKey: "submissiondte",

			header: "Submission Date",

			cell: ({ row }) => {
				const submissionDate = row.original.submissiondte;

				return submissionDate ? toFormattedDate(submissionDate, DATE_FORMAT.MM_SLASH_DD_YYYY) : "-";
			},
		},

		{
			accessorKey: "type",

			header: "Type",

			cell: ({ row }) => {
				const type = row.original.type;

				if (!type) {
					return "-";
				}

				return attendanceTypeLabelMap[type];
			},
		},

		{
			accessorKey: "sched_tme",

			header: "Scheduled Time",

			cell: ({ row }) => {
				const schedTime = row.original.sched_tme;

				return schedTime ? toFormattedDate(schedTime, DATE_FORMAT.HH_MM_AA_PM) : "-";
			},
		},

		{
			accessorKey: "actual_tme",

			header: "Actual Time",

			cell: ({ row }) => {
				const actualTime = row.original.actual_tme;

				return actualTime ? toFormattedDate(actualTime, DATE_FORMAT.HH_MM_AA_PM) : "-";
			},
		},

		{
			accessorKey: "other_reason",

			header: "Reason",

			cell: ({ row }) => {
				const reason = row.original.other_reason;
				if (!reason) return "-";
				return (
					<AppTooltip
						trigger={<span className="block max-w-[200px] truncate text-left">{reason}</span>}
						text={reason}
					/>
				);
			},
		},

		{
			accessorKey: "comment",

			header: "Comment",

			cell: ({ row }) => {
				const comment = row.original.comment;
				if (!comment) return "-";
				return (
					<AppTooltip
						trigger={<span className="block max-w-[200px] truncate text-left">{comment}</span>}
						text={comment}
					/>
				);
			},
		},

		{
			accessorKey: "approved",

			header: "Approved",

			cell: ({ row }) => {
				const approved = row.original.approved;

				if (approved === null) {
					return "-";
				}

				return approved ? "Yes" : "No";
			},
		},

		{
			accessorKey: "approvedBy",

			header: "Approved By",

			cell: ({ row }) => {
				return row.original.approvedBy ?? "-";
			},
		},
	];

	return columns;
};
