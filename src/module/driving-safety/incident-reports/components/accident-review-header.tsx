"use client";

import SidebarBackButton from "@/components/common/sidebar-back-button";
import { cn } from "@/lib/utils/utils";

import { IAccidentReviewDetail } from "../types";
import { ACCIDENT_REPORT_PREFIX, formatReportNumber, INCIDENT_STATUS_META } from "../utils/constants";

const AccidentReviewHeader = ({ report }: { report: IAccidentReviewDetail }) => {
	const statusMeta = INCIDENT_STATUS_META[report.status];

	return (
		<div className="flex flex-wrap items-start justify-between gap-3">
			<div className="flex items-start">
				<SidebarBackButton />
				<div>
					<h2 className="text-2xl font-semibold text-brand-dark">
						{formatReportNumber(ACCIDENT_REPORT_PREFIX, report.reportId, report.createdAt)}
					</h2>
					<div className="my-2 flex items-center gap-2">
						<span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-brand-red">
							Accident
						</span>
						<span className={cn("inline-flex rounded-[10px] px-3 py-1 text-xs font-medium", statusMeta.className)}>
							{statusMeta.label}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AccidentReviewHeader;
