import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { JobLevelCommsDailyRecord } from "../utils/types";

const sortByDateAsc = (records: JobLevelCommsDailyRecord[]) =>
	[...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

export default function JobLevelDetailsPhaseReadiness({
	readinessEntries,
}: {
	readinessEntries: JobLevelCommsDailyRecord[];
}) {
	const sortedEntries = sortByDateAsc(readinessEntries);

	return (
		<div className="space-y-2">
			<h4 className="text-sm font-semibold uppercase tracking-wide text-brand-greyLight">
				Initial Site Readiness Status
			</h4>
			{sortedEntries.length === 0 ? (
				<p className="text-xs text-brand-dark50">No readiness updates.</p>
			) : (
				<div className="space-y-4 rounded-[10px] border border-brand-dark10 bg-white p-4">
					{sortedEntries.map((record) => {
						const isReady = Boolean(record.notReadyUpdate?.isReady);
						const isClean = Boolean(record.notReadyUpdate?.isClean);
						const statusLabel = isReady ? "Marked Ready" : "Not Ready";
						const statusDate = toFormattedDate(record.date, DATE_FORMAT.MM_SLASH_DD_YYYY);

						return (
							<div key={record.id} className="space-y-2">
								<div className="flex items-center justify-between gap-2">
									<div
										className={`flex items-center gap-2 text-sm font-semibold ${
											isReady ? "text-green-600" : "text-[#991B1B]"
										}`}
									>
										{isReady ? <FiCheckCircle className="h-4 w-4" /> : <FiXCircle className="h-4 w-4" />}
										{statusLabel}
									</div>
									<span className="text-xs font-medium text-brand-dark50">{statusDate}</span>
								</div>

								{!isReady && (
									<div className="space-y-2">
										<p className="text-xs font-semibold tracking-wide text-[#475569]">PENDING ITEMS:</p>
										<ul className="space-y-1 text-sm text-[#334155]">
											<li className="flex items-start gap-2">
												<span className="mt-2 h-1.5 w-1.5 rounded-full bg-red-500"></span>
												Site Not Accessible
											</li>
											<li className="flex items-start gap-2">
												<span
													className={`mt-2 h-1.5 w-1.5 rounded-full ${isClean ? "bg-green-500" : "bg-red-500"}`}
												></span>
												{isClean ? "Home Is Clean" : "Home Not Clean for Work"}
											</li>
										</ul>
									</div>
								)}

								{record.notReadyUpdate?.note && (
									<p className="whitespace-normal break-words text-justify text-xs font-normal leading-4 text-brand-dark80">
										<span className="font-medium">Note:</span> {record.notReadyUpdate.note}
									</p>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
