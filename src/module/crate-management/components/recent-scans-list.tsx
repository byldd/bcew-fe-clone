import { DATE_FORMAT } from "@/types/date";
import { toLocalFormattedDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/utils";
import { CRATE_SCAN_ACTION } from "../enums";
import { IRecentCrateScan } from "../types";

const STATUS_LABEL: Record<CRATE_SCAN_ACTION, string> = {
	[CRATE_SCAN_ACTION.CRATE_SCANNED_TO_RECEIVE]: "Received",
	[CRATE_SCAN_ACTION.CRATE_SCANNED_TO_RETURN]: "Returned",
};

const STATUS_COLOR: Record<CRATE_SCAN_ACTION, string> = {
	[CRATE_SCAN_ACTION.CRATE_SCANNED_TO_RECEIVE]: "text-green-600",
	[CRATE_SCAN_ACTION.CRATE_SCANNED_TO_RETURN]: "text-blue-600",
};

interface RecentScansListProps {
	scans: IRecentCrateScan[];
}

export default function RecentScansList({ scans }: RecentScansListProps) {
	if (scans.length === 0) {
		return <p className="py-6 text-center text-sm text-gray-400">No recent scans yet.</p>;
	}

	return (
		<div className="space-y-3">
			{scans.map((scan) => {
				const scanAction = scan.scan_action as CRATE_SCAN_ACTION;
				return (
					<div
						key={scan.id}
						className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-3 shadow-sm hover:bg-gray-50"
					>
						<div>
							<p className="text-sm font-medium text-gray-900">CRATE-{scan.scanned_crate}</p>
							<p className="mt-0.5 text-xs text-gray-400">{scan.jobName ?? "—"}</p>
						</div>
						<div className="text-right">
							<p className={cn("text-sm font-medium", STATUS_COLOR[scanAction])}>{STATUS_LABEL[scanAction]}</p>
							<p className="mt-0.5 text-xs text-gray-400">
								{toLocalFormattedDate(scan.scanned_date, DATE_FORMAT.DATE_AND_TIME)}
							</p>
						</div>
					</div>
				);
			})}
		</div>
	);
}
