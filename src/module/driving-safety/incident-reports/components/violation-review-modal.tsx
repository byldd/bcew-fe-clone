"use client";

import { FileText } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils/utils";
import { toLocalFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";

import { useViolationReportDetail } from "../hooks/useViolationReport";
import { IViolationReportDetail } from "../types";
import { INCIDENT_SEVERITY_META } from "../utils/constants";
import { fileNameFromKeyFile } from "../utils/accident-review-display";

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
	<div className="flex items-start justify-between gap-4 border-b pb-1 text-sm">
		<span className="text-brand-dark50">{label}</span>
		<span className="max-w-[60%] text-right font-medium text-brand-dark">{value}</span>
	</div>
);

const SeverityValue = ({ detail }: { detail: IViolationReportDetail }) => {
	if (!detail.severity) return <>--</>;
	const meta = INCIDENT_SEVERITY_META[detail.severity];
	return <span className={meta.className}>{meta.label}</span>;
};

const ViolationReviewBody = ({ detail }: { detail: IViolationReportDetail }) => (
	<div className="space-y-6 px-2 pt-4">
		<div className="space-y-3">
			<h3 className="border-b pb-1 text-sm font-medium text-brand-dark50">Basic Information</h3>
			<div className="space-y-2.5">
				<InfoRow label="Employee Name" value={detail.user?.name ?? "--"} />
				<InfoRow label="Truck" value={detail.truckNumber ?? "--"} />
				<InfoRow label="Violation Type" value={detail.violationType?.name ?? "--"} />
				<InfoRow label="Point Weight" value={detail.points ?? "--"} />
				<InfoRow label="Severity" value={<SeverityValue detail={detail} />} />
				<InfoRow
					label="Date & Time"
					value={detail.violationDate ? toLocalFormattedDate(detail.violationDate, DATE_FORMAT.DATE_AND_TIME) : "--"}
				/>
				<InfoRow label="Detail" value={detail.description ?? "--"} />
			</div>
		</div>

		{detail.documents.length > 0 && (
			<div className="space-y-3 border-t border-brand-dark10 pt-4">
				<h3 className="text-sm font-medium text-brand-dark50">Uploaded Documents</h3>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					{detail.documents.map((document) => (
						<a
							key={document.id}
							href={document.url}
							target="_blank"
							rel="noopener noreferrer"
							className={cn(
								"flex items-center gap-2 rounded-[10px] border border-[#FFC9C9] bg-[#FEF2F2] px-3 py-2.5",
								"text-sm text-brand-dark hover:bg-red-50"
							)}
						>
							<FileText size={16} className="shrink-0 text-[#E7000B]" />
							<span className="truncate">{fileNameFromKeyFile(document.keyFile)}</span>
						</a>
					))}
				</div>
			</div>
		)}
	</div>
);

const ViolationReviewModal = ({ violationId }: { violationId: string }) => {
	const { data: detail, isLoading, isError } = useViolationReportDetail(violationId);

	if (isLoading) {
		return (
			<div className="flex h-40 items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (isError || !detail) {
		return <p className="py-10 text-center text-sm text-brand-red">Unable to load the violation report.</p>;
	}

	return <ViolationReviewBody detail={detail} />;
};

export default ViolationReviewModal;
