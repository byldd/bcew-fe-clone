"use client";

import { Spinner } from "@/components/ui/spinner";
import SidebarBackButton from "@/components/common/sidebar-back-button";
import { toLocalFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { FALLBACK } from "@/module/job-level-details/constants";

import { useLegacyBreakdownDetail } from "../hooks/useBreakdownReport";
import { ILegacyBreakdownDetail } from "../types";
import { asUtcInstant } from "../utils/constants";
import BreakdownKeyResources from "../components/breakdown-key-resources";

const SectionTitle = ({ children }: { children: string }) => (
	<h3 className="text-xs font-semibold text-brand-dark50">{children}</h3>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
	<div className="flex items-start justify-between gap-4 text-sm">
		<span className="text-brand-dark50">{label}</span>
		<span className="max-w-[60%] text-right font-medium text-brand-dark">{value}</span>
	</div>
);

const LegacyBreakdownReviewPage = ({ detail }: { detail: ILegacyBreakdownDetail }) => (
	<div className="space-y-4">
		<div className="flex items-center">
			<SidebarBackButton />
			<h2 className="text-2xl font-semibold text-brand-dark">Vehicle Breakdown Report</h2>
		</div>

		<div className="flex flex-col items-start gap-4 xl:flex-row">
			<div className="w-full flex-1 space-y-3 rounded-[12px] bg-white p-5 shadow-md">
				<SectionTitle>Basic information</SectionTitle>
				<div className="space-y-2.5">
					<InfoRow label="Request #" value={detail.recordNumber} />
					<InfoRow label="Truck #" value={detail.truckNumber ?? FALLBACK} />
					<InfoRow label="Reported by" value={detail.employeeName ?? FALLBACK} />
					<InfoRow
						label="Submitted"
						value={detail.date ? toLocalFormattedDate(asUtcInstant(detail.date), DATE_FORMAT.DATE_AND_TIME) : FALLBACK}
					/>
					<InfoRow label="Issue" value={detail.issue ?? FALLBACK} />
					<InfoRow label="Description" value={detail.description ?? FALLBACK} />
					<InfoRow label="Notes" value={detail.notes ?? FALLBACK} />
				</div>
			</div>

			<aside className="flex w-full shrink-0 flex-col gap-4 xl:w-[300px]">
				<div className="space-y-2 rounded-[12px] bg-white p-5 shadow-md">
					<h3 className="text-base font-semibold text-brand-dark">Status</h3>
					<p className="text-sm text-brand-dark50">
						This is a manual entry imported from the legacy system and is read-only.
					</p>
				</div>
				<div className="rounded-[12px] bg-white p-4 shadow-md">
					<BreakdownKeyResources />
				</div>
			</aside>
		</div>
	</div>
);

const LegacyBreakdownReview = ({ reportId }: { reportId: string }) => {
	const { data: detail, isLoading, isError } = useLegacyBreakdownDetail(reportId);

	if (isLoading) {
		return (
			<div className="flex h-[60vh] w-full items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (isError || !detail) {
		return <p className="py-10 text-center text-sm text-brand-red">Unable to load the breakdown report.</p>;
	}

	return <LegacyBreakdownReviewPage detail={detail} />;
};

export default LegacyBreakdownReview;
