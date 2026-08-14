"use client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FaRegEdit } from "react-icons/fa";
import { ViewJobNotes } from "./view-job-notes";
import EditLoggedTimeModal from "./edit-log-time-modal";
import { detailHeaders } from "../utils/constants";
import { EmployeeStopDetailsProps } from "../types";
import { JOB_PHASE_LABEL, SCHEDULE_ROW_TYPE_LABEL } from "../../weekly-schedule-management/constants/week-schedule";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { QC_JOB_TYPE } from "../../weekly-schedule-management/types/schedule-interface";
import { calculateStopHours } from "../utils/calculate-hours";
import { JobWorkType } from "@/module/job/utils/enums";
import { formatPascalCase } from "@/lib/utils/value-formatter";
import { getStopTime } from "@/utils/time-logs";
import { AppTooltip } from "@/components/ui/tooltip";

export default function EmployeeStopDetails({
	jobs,
	isTimeLogsEditAccess,
	employeeName,
	openModal,
	rosterTime,
	closeModal,
	refetch,
	employeeDayTimes,
	trackTimeByGPS,
}: EmployeeStopDetailsProps) {
	return (
		<TableRow className="w-full">
			<TableCell colSpan={12} className="p-0">
				<Table className="min-w-full">
					<TableHeader className="bg-white [&_tr]:border-accent/15">
						<TableRow>
							{detailHeaders.map((label) => (
								<TableHead
									key={label}
									className="whitespace-nowrap border-b border-r bg-brand-bgLightgrey px-6 py-4 text-center text-sm font-semibold text-brand-dark50"
								>
									{label}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>

					<TableBody>
						{jobs &&
							jobs
								.sort((a, b) => (a.stopNumber || Number.MAX_SAFE_INTEGER) - (b.stopNumber || Number.MAX_SAFE_INTEGER))
								.map((stop, si) => {
									const {
										stopNumber,
										jobnme,
										tsknme,
										startTime,
										endTime,
										gpsStart,
										gpsEnd,
										overrideStartTime,
										overrideEndTime,
										overrideReason,
										overTimeReason,
										dailyJobNotes,
										specialJob,
										tsknum,

										isQcJob,
										ordnum,
										qcType,
										didNotWorked,
										qcInspectionTime,
									} = stop;

									const qcJobType = qcType
										? `${qcType === QC_JOB_TYPE.REPAIR ? SCHEDULE_ROW_TYPE_LABEL.QC_REPAIR : SCHEDULE_ROW_TYPE_LABEL.QC_INSPECTION}`
										: null;

									const stopHours = calculateStopHours({
										stop,
										employeePauseTime: employeeDayTimes?.employeePauseTime,
									});

									const jobName = specialJob?.name ?? jobnme;

									const { stopStartTime, stopEndTime } = getStopTime(stop);
									const isTimeLogCompleted = stopStartTime && stopEndTime;

									return (
										<TableRow key={si}>
											<TableCell className="border-r px-4 py-2 text-center"> {stopNumber ? stopNumber : "-"}</TableCell>
											<TableCell className="border-r px-4 py-2 text-center">{formatPascalCase(jobName)}</TableCell>
											<TableCell className="border-r px-4 py-2 text-center">
												{isQcJob ? JOB_PHASE_LABEL[Number(tsknum)] : tsknme || ordnum || "--"}
												{qcJobType ? ` (` + qcJobType + `)` : ""}
											</TableCell>
											<TableCell className="border-r px-4 py-2 text-center">
												<div>
													{!isTimeLogCompleted && qcInspectionTime?.timeValidationNote ? (
														<AppTooltip text={qcInspectionTime?.timeValidationNote} />
													) : null}
													<span className="block">
														{didNotWorked
															? JobWorkType.DID_NOT_WORKED
															: startTime
																? toFormattedDate(startTime, DATE_FORMAT.HH_MM_AA_PM)
																: "--"}
													</span>
													{trackTimeByGPS && (
														<span className="block text-[8px] text-brand-dark80">
															GPS:
															{gpsStart ? toFormattedDate(gpsStart, DATE_FORMAT.HH_MM_AA_PM) : "--"}
														</span>
													)}
												</div>
											</TableCell>
											<TableCell className="border-r px-4 py-2 text-center">
												<div>
													<span className="block">
														{didNotWorked
															? JobWorkType.DID_NOT_WORKED
															: endTime
																? toFormattedDate(endTime, DATE_FORMAT.HH_MM_AA_PM)
																: "--"}
													</span>
													{trackTimeByGPS && (
														<span className="block text-[8px] text-brand-dark80">
															GPS:
															{gpsEnd ? toFormattedDate(gpsEnd, DATE_FORMAT.HH_MM_AA_PM) : "--"}
														</span>
													)}
												</div>
											</TableCell>
											<TableCell className="border-r px-4 py-2 text-center text-sm font-medium text-brand-dark">
												{overrideStartTime || overrideEndTime ? (
													<>
														{overrideStartTime ? toFormattedDate(overrideStartTime, DATE_FORMAT.HH_MM_AA_PM) : "--"} -{" "}
														{overrideEndTime ? toFormattedDate(overrideEndTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}
													</>
												) : (
													"--"
												)}
											</TableCell>

											<TableCell className="border-r px-4 py-2 text-center">{stopHours}</TableCell>

											<TableCell className="border-r px-4 py-2 text-center">
												<ViewJobNotes
													overrideReason={overrideReason}
													overTimeReason={overTimeReason}
													dailyJobNotes={dailyJobNotes}
												/>
											</TableCell>
											<TableCell className="mt-2 flex justify-center border-r px-4 py-2 text-center">
												<FaRegEdit
													className={`mr-2 ${!isTimeLogsEditAccess ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
													onClick={() => {
														if (isTimeLogsEditAccess) {
															openModal({
																modalTitle: (
																	<span>
																		Edit Logged Time
																		{stopNumber ? ` (S${stopNumber})` : ""}
																	</span>
																),
																subHeader: <p className="text-sm font-normal text-brand-grey">{jobnme}</p>,

																modalView: (
																	<EditLoggedTimeModal
																		onClose={closeModal}
																		onSave={refetch}
																		stop={stop}
																		employeeName={employeeName}
																		trackTimeByGPS={trackTimeByGPS}
																		rosterTime={rosterTime}
																	/>
																),
															});
														}
													}}
												/>
											</TableCell>
										</TableRow>
									);
								})}
					</TableBody>
				</Table>
			</TableCell>
		</TableRow>
	);
}
