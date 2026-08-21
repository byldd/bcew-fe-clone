"use client";

import { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { FileText } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import SidebarBackButton from "@/components/common/sidebar-back-button";
import { cn } from "@/lib/utils/utils";
import { toLocalFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";

import { useSafetyViolationDetail, useViolationReportDetail } from "../hooks/useViolationReport";
import { ISafetyViolationDetail, IViolationReportDetail } from "../types";
import {
	asUtcInstant,
	buildGeotabExceptionUrl,
	buildGoogleMapsUrl,
	formatReportNumber,
	INCIDENT_SEVERITY_META,
	VIOLATION_REPORT_PREFIX,
	VIOLATION_SOURCE_PARAM,
} from "../utils/constants";
import { INCIDENT_SOURCE } from "../utils/enums";
import { fileNameFromKeyFile } from "../utils/accident-review-display";

const SectionTitle = ({ children }: { children: string }) => (
	<h3 className="text-xs font-semibold text-brand-dark50">{children}</h3>
);

const InfoRow = ({ label, value }: { label: string; value: ReactNode }) => (
	<div className="flex items-start justify-between gap-4 text-sm">
		<span className="text-brand-dark50">{label}</span>
		<span className="max-w-[60%] text-right font-medium text-brand-dark">{value}</span>
	</div>
);

const PageShell = ({ children }: { children: ReactNode }) => (
	<div className="space-y-4">
		<div className="flex items-center">
			<SidebarBackButton />
			<h2 className="text-2xl font-semibold text-brand-dark">Driving Safety Violation</h2>
		</div>
		<div className="w-full space-y-6 rounded-[12px] bg-white p-5 shadow-md xl:max-w-3xl">{children}</div>
	</div>
);

const StateWrapper = ({
	isLoading,
	isError,
	children,
}: {
	isLoading: boolean;
	isError: boolean;
	children: ReactNode;
}) => {
	if (isLoading) {
		return (
			<div className="flex h-[60vh] w-full items-center justify-center">
				<Spinner />
			</div>
		);
	}
	if (isError) {
		return <p className="py-10 text-center text-sm text-brand-red">Unable to load the violation report.</p>;
	}
	return <>{children}</>;
};

const OfficeViolationBody = ({ detail }: { detail: IViolationReportDetail }) => (
	<>
		<div className="space-y-3">
			<SectionTitle>Basic Information</SectionTitle>
			<div className="space-y-2.5">
				<InfoRow
					label="Request #"
					value={formatReportNumber(VIOLATION_REPORT_PREFIX, detail.reportId, detail.createdAt)}
				/>
				<InfoRow label="Employee Name" value={detail.user?.name ?? "--"} />
				<InfoRow label="Truck #" value={detail.truckNumber ?? "--"} />
				<InfoRow label="Violation Type" value={detail.violationType?.name ?? "--"} />
				<InfoRow label="Point Weight" value={detail.points ?? "--"} />
				<InfoRow
					label="Severity"
					value={
						detail.severity ? (
							<span className="text-brand-dark50">{INCIDENT_SEVERITY_META[detail.severity].label}</span>
						) : (
							"--"
						)
					}
				/>
				<InfoRow
					label="Date & Time"
					value={detail.violationDate ? toLocalFormattedDate(detail.violationDate, DATE_FORMAT.DATE_AND_TIME) : "--"}
				/>
				<InfoRow label="Description" value={detail.description ?? "--"} />
			</div>
		</div>

		{detail.documents.length > 0 && (
			<div className="space-y-3 border-t border-brand-dark10 pt-4">
				<SectionTitle>Uploaded Document</SectionTitle>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					{detail.documents.map((document) => (
						<a
							key={document.id}
							href={document.url}
							target="_blank"
							rel="noopener noreferrer"
							className={cn(
								"flex items-center gap-2 rounded-[10px] border border-brand-dark10 bg-brand-bgLightgrey px-3 py-2.5",
								"text-sm text-brand-dark hover:bg-brand-dark10"
							)}
						>
							<FileText size={16} className="shrink-0 text-brand-dark50" />
							<span className="truncate">{fileNameFromKeyFile(document.keyFile)}</span>
						</a>
					))}
				</div>
			</div>
		)}
	</>
);

const GeotabViolationBody = ({ detail }: { detail: ISafetyViolationDetail }) => (
	<div className="space-y-3">
		<SectionTitle>Basic Information</SectionTitle>
		<div className="space-y-2.5">
			<InfoRow label="Request #" value={detail.geotabId} />
			<InfoRow label="Truck #" value={detail.truck ?? "--"} />
			<InfoRow label="Violation Type" value={detail.violationType ?? "--"} />
			<InfoRow label="Employee Name" value={detail.employeeName ?? "--"} />
			<InfoRow
				label="Source"
				value={
					<span className="inline-flex items-center gap-1.5">
						GeoTab
						<a
							href={buildGeotabExceptionUrl(detail.geotabId)}
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-600 underline underline-offset-2"
						>
							(View Camera Footage)
						</a>
					</span>
				}
			/>
			<InfoRow label="Point Weight" value={detail.pointWeight ?? "--"} />
			{/* The GeoTab feed carries no severity of its own. */}
			<InfoRow label="Severity" value="--" />
			<InfoRow
				label="Location"
				value={
					detail.latitude !== null && detail.longitude !== null ? (
						<a
							href={buildGoogleMapsUrl(`${detail.latitude}, ${detail.longitude}`)}
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-600 underline underline-offset-2"
						>
							View Location
						</a>
					) : (
						"--"
					)
				}
			/>
			<InfoRow
				label="Date & Time"
				value={
					detail.activeFrom ? toLocalFormattedDate(asUtcInstant(detail.activeFrom), DATE_FORMAT.DATE_AND_TIME) : "--"
				}
			/>
			<InfoRow label="Status" value={detail.decision ?? "Pending"} />
			<InfoRow label="Description" value={detail.description ?? "--"} />
		</div>
	</div>
);

const OfficeViolationReview = ({ reportId }: { reportId: string }) => {
	const { data, isLoading, isError } = useViolationReportDetail(reportId);
	return (
		<StateWrapper isLoading={isLoading} isError={isError || !data}>
			<PageShell>{data && <OfficeViolationBody detail={data} />}</PageShell>
		</StateWrapper>
	);
};

const GeotabViolationReview = ({ reportId }: { reportId: string }) => {
	const { data, isLoading, isError } = useSafetyViolationDetail(reportId);
	return (
		<StateWrapper isLoading={isLoading} isError={isError || !data}>
			<PageShell>{data && <GeotabViolationBody detail={data} />}</PageShell>
		</StateWrapper>
	);
};

const ViolationReportReview = ({ reportId }: { reportId: string }) => {
	const isGeotab = useSearchParams().get(VIOLATION_SOURCE_PARAM) === INCIDENT_SOURCE.GEOTAB;
	return isGeotab ? <GeotabViolationReview reportId={reportId} /> : <OfficeViolationReview reportId={reportId} />;
};

export default ViolationReportReview;
