import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { FALLBACK } from "../constants";
import { JobLevelCommsPhase } from "../utils/types";
import { InfoField } from "./job-level-details-shared";
import { getDateRange } from "../utils";

export default function JobLevelDetailsPhaseQc({ phase }: { phase: JobLevelCommsPhase }) {
	return (
		<div className="space-y-2">
			<h4 className="text-sm font-semibold uppercase tracking-wide text-brand-greyLight">QC Status</h4>
			{phase.qcJobs.length === 0 ? (
				<p className="text-xs text-brand-dark50">No QC jobs.</p>
			) : (
				<div className="space-y-3">
					{phase.qcJobs.map((qc) => {
						const qcDates = getDateRange(qc.jobDailyRecords);
						const user = qc.jobDailyRecords[0]?.jobEmployeeAssignments?.[0]?.employee?.user;
						const foreman = user?.name || FALLBACK;
						const phone = user?.cellPhone || FALLBACK;

						return (
							<div key={qc.id} className="rounded-[10px] border border-brand-dark10 bg-white p-4">
								<div className="no-scrollbar grid grid-cols-2 items-start gap-x-6 gap-y-4 overflow-x-auto sm:flex sm:gap-x-8">
									<InfoField
										label="Scheduled Start & End Date"
										className="shrink-0"
										valueClassName="whitespace-nowrap font-semibold"
										value={
											qc.bcewScheduleDate
												? toFormattedDate(qc.bcewScheduleDate, DATE_FORMAT.MM_SLASH_DD_YYYY)
												: FALLBACK
										}
									/>
									<InfoField
										label="Actual Start & End Date"
										className="shrink-0"
										valueClassName="whitespace-nowrap font-semibold"
										value={qcDates.start}
									/>
									<InfoField
										label="Foreman"
										className="shrink-0"
										valueClassName="whitespace-nowrap font-semibold"
										value={foreman}
									/>
									<InfoField
										label="Foreman's Phone Number"
										className="shrink-0"
										valueClassName="whitespace-nowrap font-semibold"
										value={phone}
									/>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
