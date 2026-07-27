import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { CircleCheck, CircleX } from "lucide-react";
import { JobLevelCommsDailyRecord } from "../utils/types";

function UpdateRow({
	label,
	value,
	showBullet = true,
	bulletClassName = "bg-[#f87171]",
}: {
	label: string;
	value: React.ReactNode;
	showBullet?: boolean;
	bulletClassName?: string;
}) {
	return (
		<div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 text-sm font-medium text-[#334155]">
			<div className="flex items-start gap-3">
				{showBullet && <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${bulletClassName}`}></span>}
				<p className="leading-tight">{label}</p>
			</div>
			<div className="min-w-[84px] text-right leading-tight">{value}</div>
		</div>
	);
}

const getYesNoValue = (value: boolean | undefined) => {
	if (typeof value !== "boolean") {
		return "--";
	}

	return value ? "Yes" : "No";
};

const getCrewDisplay = (record: JobLevelCommsDailyRecord) => {
	if (!record.forecastCrews?.length) {
		return ["--"];
	}

	return record.forecastCrews.map((crew) => {
		const crewName = crew.employee?.user?.name || crew.employee?.name || "Unknown";
		const crewHours = typeof crew.forecastHours === "number" ? `${crew.forecastHours} hrs` : null;
		return crewHours ? `${crewName} (${crewHours})` : crewName;
	});
};

const getSortedRecords = (phaseRecords: JobLevelCommsDailyRecord[]) => {
	return [...phaseRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export default function JobLevelDetailsPhaseUpdates({ phaseRecords }: { phaseRecords: JobLevelCommsDailyRecord[] }) {
	const latestRecords = getSortedRecords(phaseRecords).slice(0, 4);
	return (
		<div className="space-y-2">
			<h4 className="text-sm font-semibold uppercase tracking-wide text-brand-greyLight">Updates</h4>
			{latestRecords.length === 0 ? (
				<p className="text-xs text-brand-dark50">No updates available.</p>
			) : (
				<div className="space-y-4 rounded-[10px] border border-brand-dark10 bg-white p-4">
					{latestRecords.map((record) => (
						<div key={record.id}>
							<div className="w-full space-y-2">
								<div className="flex items-center justify-between gap-3">
									<div
										className={`flex items-center gap-2 text-sm font-semibold ${
											record.isJobFinishToday ? "text-emerald-700" : "text-[#b3261e]"
										}`}
									>
										{record.isJobFinishToday ? <CircleCheck className="h-4 w-4" /> : <CircleX className="h-4 w-4" />}
										{record.isJobFinishToday ? "Completed" : "Not Completed"}
									</div>
									<span className="text-xs font-semibold text-brand-dark50">
										{toFormattedDate(record.date, DATE_FORMAT.MM_SLASH_DD_YYYY)}
									</span>
								</div>

								{!record.isJobFinishToday && (
									<div className="space-y-2">
										<p className="text-xs font-semibold text-[#475569]">TECHNICIAN UPDATES:</p>

										<UpdateRow
											label="Was Job Completed?"
											value={getYesNoValue(record.isJobFinishToday)}
											bulletClassName={record.isJobFinishToday ? "bg-green-500" : "bg-red-500"}
										/>

										<UpdateRow
											label="Forecasting it for Tomorrow?"
											value={getYesNoValue(record.isJobFinishTomorrow)}
											bulletClassName={record.isJobFinishTomorrow ? "bg-green-500" : "bg-red-500"}
										/>

										{record.isJobFinishTomorrow === false && (
											<UpdateRow
												label="Forecasting Completion Date"
												value={
													record.forecastDate
														? toFormattedDate(record.forecastDate, DATE_FORMAT.MM_SLASH_DD_YYYY)
														: "--"
												}
												showBullet={false}
											/>
										)}

										<UpdateRow
											label="Forecasting Crew"
											value={
												<div className="space-y-0.5 text-right">
													{getCrewDisplay(record).map((crew, index) => (
														<p key={`${record.id}-crew-${index}`}>{crew}</p>
													))}
												</div>
											}
											bulletClassName={record.forecastCrews?.length ? "bg-green-500" : "bg-red-500"}
										/>

										<div className="space-y-1">
											<p className="text-xs font-semibold text-[#475569]">Reasons (By Task Leader)</p>
											{record.jobUpdateReasons.length ? (
												record.jobUpdateReasons.map((note) => (
													<p
														key={note.id}
														className="whitespace-normal break-words text-justify text-xs font-normal leading-4 text-brand-dark80"
													>
														{note.reason}
													</p>
												))
											) : (
												<p className="text-xs leading-tight text-[#334155]">--</p>
											)}
										</div>
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
