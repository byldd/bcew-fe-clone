"use client";

import { QrCode, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSameDate, toLocalFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { ICrateIssueReportSummary } from "../types";

interface ReportIssueSuccessProps {
	report: ICrateIssueReportSummary;
	onDone: () => void;
}

export default function ReportIssueSuccess({ report, onDone }: ReportIssueSuccessProps) {
	const timestamp = isSameDate(report.createdAt, new Date())
		? `Today, ${toLocalFormattedDate(report.createdAt, DATE_FORMAT.HH_MM_AA_PM)}`
		: toLocalFormattedDate(report.createdAt, DATE_FORMAT.DATE_AND_TIME);

	const rows = [
		["Job Name", report.jobName ?? "—"],
		...(report.crateId ? [["Crate ID", report.crateId]] : []),
		["Photos", `${report.photosCount} uploaded`],
		["Timestamp", timestamp],
	];

	return (
		<div className="flex min-h-screen flex-col bg-brand-bgLightgrey px-6 pb-8 pt-16">
			<div className="flex flex-1 flex-col items-center">
				<div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
					<TriangleAlert className="h-9 w-9 text-red-600" />
				</div>
				<p className="mt-4 text-lg font-semibold text-gray-900">Report Submitted</p>
				<p className="mt-1 text-center text-xs text-gray-400">
					Admin has been notified. The issue will be reviewed and resolved shortly.
				</p>

				<div className="mt-6 flex w-full max-w-xs items-center justify-between rounded-xl border border-gray-100 bg-white px-3 py-2.5">
					<div className="flex items-center gap-2">
						<QrCode className="h-4 w-4 text-red-500" />
						<span className="text-sm font-medium text-gray-900">{report.reportId}</span>
					</div>
					<span className="text-sm font-medium text-red-500">{report.isResolved ? "Resolved" : "Under review"}</span>
				</div>

				<div className="mt-4 w-full max-w-xs divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white">
					{rows.map(([label, value]) => (
						<div key={label} className="flex items-center justify-between gap-3 px-3 py-2.5">
							<span className="shrink-0 whitespace-nowrap text-sm text-gray-500">{label}</span>
							<span className="text-right text-sm font-semibold text-gray-900">{value}</span>
						</div>
					))}
				</div>
			</div>

			<Button type="button" variant="filled" onClick={onDone} className="h-auto w-full rounded-2xl py-4 text-sm">
				Back to Home
			</Button>
		</div>
	);
}
