"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSameDate, toLocalFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { ICrateReturnScanSummary } from "../types";

interface ReturnSuccessProps {
	summary: ICrateReturnScanSummary;
	onDone: () => void;
}

export default function ReturnSuccess({ summary, onDone }: ReturnSuccessProps) {
	const timestamp = isSameDate(summary.scannedDate, new Date())
		? `Today, ${toLocalFormattedDate(summary.scannedDate, DATE_FORMAT.HH_MM_AA_PM)}`
		: toLocalFormattedDate(summary.scannedDate, DATE_FORMAT.DATE_AND_TIME);

	const rows = [
		["Job Name", summary.jobName ?? "—"],
		["Seal Tag", summary.sealTagNumber ?? "—"],
		["Photos", `${summary.photosCount} uploaded`],
		["Timestamp", timestamp],
	];

	return (
		<div className="flex min-h-screen flex-col bg-brand-bgLightgrey px-6 pb-4 pt-20">
			<div className="flex flex-1 flex-col items-center">
				<div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E7F9E8]">
					<CheckCircle2 className="h-9 w-9 text-[#0CC312]" />
				</div>
				<p className="mt-4 text-lg font-semibold text-gray-900">Return Confirmed</p>
				<p className="mt-1 text-center text-xs text-gray-400">Crate ID {summary.assetId} has been logged for return.</p>

				<div className="mt-6 w-full max-w-sm divide-y divide-gray-100 rounded-[8px] border border-gray-100 bg-white">
					{rows.map(([label, value]) => (
						<div key={label} className="flex items-start justify-between gap-3 px-3 py-2.5">
							<span className="shrink-0 whitespace-nowrap pt-px text-sm text-gray-500">{label}</span>
							<span className="text-right text-sm font-semibold text-gray-900">{value}</span>
						</div>
					))}
				</div>

				<p className="mt-4 text-center text-xs text-gray-400">
					The warehouse has been sent the seal tag reference for verification on delivery.
				</p>
			</div>

			<Button type="button" variant="filled" onClick={onDone} className="h-10 w-full">
				Done
			</Button>
		</div>
	);
}
