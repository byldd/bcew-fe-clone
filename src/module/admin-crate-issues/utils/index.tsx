"use client";

import { ColumnDef } from "@tanstack/react-table";
import { toLocalFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { CRATE_ISSUE_CATEGORY_OPTIONS, CRATE_ISSUE_SEVERITY_OPTIONS } from "@/module/crate-management/utils/constants";
import { CratePhotosPreview } from "@/module/admin-crate-activity/components/crate-photos-preview";
import { IAdminCrateIssuesItem } from "../types";

export const useAdminCrateIssuesColumns = () => {
	const columns: ColumnDef<IAdminCrateIssuesItem>[] = [
		{
			id: "issueReference",
			header: "Issue Reference #",
			cell: ({ row }) => <span className="text-sm font-medium text-brand-dark">{row.original.reportId}</span>,
		},
		{
			id: "crateId",
			header: "Crate ID",
			cell: ({ row }) => <span className="text-sm font-medium text-brand-dark">{row.original.crateId ?? "--"}</span>,
		},
		{
			id: "jobName",
			header: "Job Name ",
			cell: ({ row }) => <span className="text-sm font-medium text-brand-dark">{row.original.jobName ?? "--"}</span>,
		},
		{
			id: "phase",
			header: "Phase",
			cell: ({ row }) => <span className="text-sm font-medium text-brand-dark">{row.original.phase ?? "--"}</span>,
		},
		{
			id: "technician",
			header: "Employee",
			cell: ({ row }) => row.original.submitter.name,
		},
		{
			id: "issueType",
			header: "Issue Type",
			cell: ({ row }) =>
				CRATE_ISSUE_CATEGORY_OPTIONS.find((option) => option.value === row.original.category)?.label ??
				row.original.category,
		},
		{
			id: "severity",
			header: "Severity",
			cell: ({ row }) =>
				CRATE_ISSUE_SEVERITY_OPTIONS.find((option) => option.value === row.original.severity)?.label ?? "--",
		},
		{
			id: "images",
			header: "Image",
			cell: ({ row }) => <CratePhotosPreview photos={row.original.photos} note={null} />,
		},
		{
			id: "notes",
			header: () => <span className="w-full text-center">Note</span>,
			cell: ({ row }) => (
				<span
					className="block w-full truncate text-center text-brand-dark"
					title={row.original.description ?? undefined}
				>
					{row.original.description ?? "—"}
				</span>
			),
		},
		{
			id: "dateAndTime",
			header: "Date & Time",
			cell: ({ row }) => toLocalFormattedDate(row.original.createdAt, DATE_FORMAT.DATE_AND_TIME),
		},
	];

	return columns;
};
