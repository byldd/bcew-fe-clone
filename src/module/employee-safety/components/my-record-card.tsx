import { toFormattedDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/utils";
import { DATE_FORMAT } from "@/types/date";

import { SAFETY_REPORT_TYPE, TECHNICIAN_REPORT_STATUS } from "../enums";
import { IMyRecord } from "../types";
import { TECHNICIAN_STATUS_LABEL } from "../utils/technician-report-status";

type MyRecordCardProps = {
	record: IMyRecord;
	onClick?: () => void;
};

const STATUS_COLOR: Record<TECHNICIAN_REPORT_STATUS, string> = {
	[TECHNICIAN_REPORT_STATUS.DRAFT]: "text-brand-grey",
	[TECHNICIAN_REPORT_STATUS.PENDING]: "text-amber-600",
	[TECHNICIAN_REPORT_STATUS.APPROVED]: "text-green-600",
	[TECHNICIAN_REPORT_STATUS.REJECTED]: "text-brand-red",
	[TECHNICIAN_REPORT_STATUS.ADDITIONAL_INFO_REQUESTED]: "text-purple-600",
};

const MyRecordCard = ({ record, onClick }: MyRecordCardProps) => {
	const isDraft = record.status === TECHNICIAN_REPORT_STATUS.DRAFT;
	const isAdditionalInfoRequested = record.status === TECHNICIAN_REPORT_STATUS.ADDITIONAL_INFO_REQUESTED;
	const isJobSiteInjury = record.type === SAFETY_REPORT_TYPE.JOB_SITE_INJURY;

	const submittedDate = toFormattedDate(record.submittedAt ?? record.createdAt, DATE_FORMAT.MM_SLASH_DD_YYYY);
	const subtitle = isDraft
		? `Last Edited ${toFormattedDate(record.createdAt, DATE_FORMAT.MMM_D)}${record.truckNumber ? ` • Truck ${record.truckNumber}` : ""}`
		: isAdditionalInfoRequested
			? `Requested ${submittedDate}`
			: `Submitted ${submittedDate}`;

	return (
		<button type="button" onClick={onClick} className="w-full rounded-[8px] border bg-white p-4 text-left shadow-sm">
			<div className="flex items-start justify-between gap-3">
				<p className="text-sm font-semibold text-brand-dark">{record.title}</p>
				<span className={cn("text-xs font-medium", STATUS_COLOR[record.status])}>
					{TECHNICIAN_STATUS_LABEL[record.status]}
				</span>
			</div>

			<div className="mt-1 flex items-end justify-between gap-3">
				<div>
					<p className="text-xs text-brand-grey">{subtitle}</p>
					{!isJobSiteInjury && record.status === TECHNICIAN_REPORT_STATUS.PENDING && (
						<p className="mt-1 text-xs text-brand-grey">Points: pending review</p>
					)}
				</div>
				<span className="whitespace-nowrap text-xs text-brand-grey">
					{isDraft ? "Tap to continue" : record.reportNumber}
				</span>
			</div>
		</button>
	);
};

export default MyRecordCard;
