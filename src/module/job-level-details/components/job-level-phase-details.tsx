import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { FALLBACK } from "../constants";
import { JobLevelCommsPhase } from "../utils/types";
import { ImageGrid, InfoField } from "./job-level-details-shared";
import JobLevelDetailsPhaseReadiness from "./phase-readiness";
import JobLevelDetailsPhaseQc from "./phase-qc";
import JobLevelDetailsPhaseUpdates from "./phase-updates";
import {
	flattenRecordImages,
	getDateRange,
	getForecastCompletionDate,
	getPhaseCrewLeader,
	getReadinessSummaryLabel,
} from "../utils";

export default function JobLevelDetailsPhaseDetails({
	phase,
	onOpenImagePreview,
}: {
	phase: JobLevelCommsPhase;
	onOpenImagePreview: (url: string) => void;
}) {
	const phaseDates = getDateRange(phase.jobDailyRecords);
	const phaseImages = flattenRecordImages(phase.jobDailyRecords);
	const qcImages = phase.qcJobs.flatMap((qc) => flattenRecordImages(qc.jobDailyRecords));
	const readinessEntries = phase.jobDailyRecords.filter((record) => Boolean(record.notReadyUpdate));
	const crewLeader = getPhaseCrewLeader(phase);
	const readinessLabel = getReadinessSummaryLabel(phase);
	const completionDate = phase.completeDate
		? toFormattedDate(phase.completeDate, DATE_FORMAT.MM_SLASH_DD_YYYY)
		: phaseDates.end;

	return (
		<div className="space-y-6">
			<div>
				<div className="mb-3 flex flex-wrap items-center justify-between gap-2">
					<h4 className="text-sm font-semibold uppercase tracking-wide text-brand-greyLight">Job Details</h4>
					{readinessLabel && <p className="text-sm font-medium text-teal-600">{readinessLabel}</p>}
				</div>
				<div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:flex sm:flex-wrap sm:items-start sm:gap-x-8">
					<InfoField
						label="Scheduled Start Date"
						className="shrink-0"
						valueClassName="whitespace-nowrap font-semibold"
						value={FALLBACK}
					/>
					<InfoField
						label="Actual Start Date"
						className="shrink-0"
						valueClassName="whitespace-nowrap font-semibold"
						value={phaseDates.start}
					/>
					<InfoField
						label="Scheduled End Date"
						className="shrink-0"
						valueClassName="whitespace-nowrap font-semibold"
						value={FALLBACK}
					/>
					<InfoField
						label="Forecasted Completion Date"
						className="shrink-0"
						valueClassName="whitespace-nowrap font-semibold"
						value={getForecastCompletionDate(phase)}
					/>
					<InfoField
						label="Initial Completion Date"
						className="shrink-0"
						valueClassName="whitespace-nowrap font-semibold"
						value={completionDate}
					/>
					<InfoField
						label="Crew Leader"
						className="shrink-0"
						valueClassName="whitespace-nowrap font-semibold"
						value={crewLeader.name}
					/>
					<InfoField
						label="Crew Leader's Phone Number"
						className="shrink-0"
						valueClassName="whitespace-nowrap font-semibold"
						value={crewLeader.phone}
					/>
				</div>
			</div>

			<div className="border-t border-brand-dark10" />

			<div className="grid gap-6 lg:grid-cols-2">
				<div className="space-y-4">
					<JobLevelDetailsPhaseReadiness readinessEntries={readinessEntries} />
					<ImageGrid images={phaseImages} onOpen={onOpenImagePreview} />
				</div>

				<div className="space-y-4">
					<JobLevelDetailsPhaseQc phase={phase} />
					<JobLevelDetailsPhaseUpdates phaseRecords={phase.jobDailyRecords} />
					<ImageGrid images={qcImages} onOpen={onOpenImagePreview} emptyLabel="No QC Images" />
				</div>
			</div>
		</div>
	);
}
