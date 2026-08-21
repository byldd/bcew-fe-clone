"use client";
import { JobCard } from "@/module/employee-dashboard/components/job-card";

import { IEmployeeScheduleItem } from "@/module/employee-dashboard/types";
import { routes } from "@/config/routes";
import { useRouter } from "next/navigation";
import { useEmployeeScheduleParams } from "@/module/job/hooks/useEmployeeScheduleParams";
import { useEmployeeHolidays, useEmployeeTodayRoster } from "@/module/job/hooks/useEmployeeSchedule";
import { useModal } from "@/hooks/useModal";
import JobNewStartModal from "./new-start-modal/job-new-start-modal";
import { legends } from "../constants/legend-items";
import { dateToUTCString, getTodayDate, isATimeWithinRange, isSameDate, toDate } from "@/lib/utils/date";
import AddNewStopButton from "./add-new-stop/add-new-stop-button";
import { Spinner } from "@/components/ui/spinner";
import { holidayTypes } from "@/module/schedule-management/weekly-schedule-management/utils/enums";
import HolidayBanner from "./holiday-Banner";
import LateStatusTopBar from "./late-status-top-bar";
import LateStatusModal from "./late-status-modal";
import { useEmployeeDayTime } from "../hooks/foreman";
import { useMemo } from "react";
import EarlyStatusTopBar from "./early-status-topbar";
import LateEarlyStatusTopBar from "./late-early-status-top-bar";
import EarlyStatusModal from "./early-status-modal";
import LateEarlyStatusModal from "./late-early-status-modal";
import { Button } from "@/components/ui/button";
import { FaRegSquarePlus } from "react-icons/fa6";
import { WEEK_DAY_NUMBERS } from "@/utils/enums";
import { E_ROLES } from "@/utils/enums";
import useAuthStore from "@/store/auth-store";
import { MDTRequestsCard } from "./mdtr-card";
import { useEmployeeJobContext } from "../context/JobContext";
import { useEmployeeMDTRequests } from "@/module/midday-stops/hooks/useEmployeeMiddayStop";
import SelfScheduleAddJobTrigger from "./self-schedule/self-schedule-add-job-trigger";
import GpsNotWorkingBanner from "./gps-not-working/gps-not-working-banner";
import { IEmployeeDayVarianceStatus, IEmployeeGPSWorking, IEmployeeLockStatus } from "@/module/job/types";
import LockScreenBanner from "./lockscreen-banner";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { getSelfScheduleEnabledDateRange } from "../utils/self-schedule";
import { cn } from "@/lib/utils/utils";
import GpsAfterHourUsageBanner from "./GpsAfterHourUsage/gps-after-hour-usage-banner";
import { getUserExemptFromSpecialCardTimeLogging } from "@/module/employee/utils/role";

export function JobList({
	isTimeLogPending,
	setSelfScheduleOpen,
	gpsWorkingData,
	pendingLogs,
	dayVarianceStatus,
}: {
	isTimeLogPending: boolean | undefined;
	setSelfScheduleOpen: (open: boolean) => void;
	gpsWorkingData: IEmployeeGPSWorking | undefined;
	pendingLogs: IEmployeeLockStatus | undefined;
	dayVarianceStatus: IEmployeeDayVarianceStatus | undefined;
}) {
	const router = useRouter();
	const { user } = useAuthStore((state) => state);
	const { getParams } = useEmployeeScheduleParams();
	const { startDate } = getParams();
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	const { jobs, isJobLoading, refetchJobs } = useEmployeeJobContext();

	const { data: MDTRequests } = useEmployeeMDTRequests({ startDate: dateToUTCString(startDate) });
	const { data: holiday } = useEmployeeHolidays({ startDate: dateToUTCString(startDate) });
	const { data: rosterData } = useEmployeeTodayRoster({ date: dateToUTCString(startDate) });
	const stableFilters = useMemo(() => {
		return { startDate: dateToUTCString(startDate) };
	}, [startDate]);
	const { data: employeeDayTime } = useEmployeeDayTime(stableFilters);

	const isCurrentDate = isSameDate(startDate, getTodayDate());

	const selectedDate = toDate(startDate);

	const isSaturday = selectedDate.getDay() === WEEK_DAY_NUMBERS.SATURDAY;
	const isSunday = selectedDate.getDay() === WEEK_DAY_NUMBERS.SUNDAY;
	const isWeekend = isSaturday || isSunday;

	const isWeekendSelfSchedulingAllowed = user?.isWeekendSelfSchedulingAllowed === true;
	const isSelfSchedulingAllowed = user?.isSelfSchedulingAllowed === true;

	const isSpecialCardTimeLoggingExempt =
		user &&
		user?.role &&
		getUserExemptFromSpecialCardTimeLogging({
			user,
			userRole: user?.role,
		});

	const isSelfSchedulingEnabledForSelectedDate = isWeekend ? isWeekendSelfSchedulingAllowed : isSelfSchedulingAllowed;

	const { selfScheduleStartDate, selfScheduleEndDate } = getSelfScheduleEnabledDateRange();

	const isForeman = user?.role?.name?.toLowerCase() === E_ROLES.FOREMAN.toLowerCase();

	const isSelectedDayIsIntoSelfScheduleRange = isATimeWithinRange(
		{ startTime: toDate(selfScheduleStartDate), endTime: toDate(selfScheduleEndDate) },
		selectedDate
	);

	const showSelScheduleButton =
		!isSpecialCardTimeLoggingExempt &&
		isSelectedDayIsIntoSelfScheduleRange &&
		!isTimeLogPending &&
		(isSelfSchedulingAllowed || (isWeekend && isWeekendSelfSchedulingAllowed));

	const hideMiddayStopButton =
		isForeman ||
		selectedDate > getTodayDate() ||
		(selectedDate < getTodayDate() && employeeDayTime?.dayEndTime) ||
		showSelScheduleButton ||
		isSpecialCardTimeLoggingExempt;

	const { openModal, closeModal, Modal } = useModal();
	const handleRouter = (id: string) => {
		router.push(routes.employee.job(id));
	};

	const handleClose = (id?: string) => {
		if (id) {
			handleRouter(id);
		}
		refetchJobs();
		closeModal();
	};

	const showLateBanner = dayVarianceStatus?.isLateArrival ?? false;

	const showEarlyBanner = dayVarianceStatus?.isEarlyLogout ?? false;

	const isLatenessResponseSentOrHandled = !dayVarianceStatus?.pendingLate;
	const isEarlyQuitResponseSentOrHandled = !dayVarianceStatus?.pendingEarly;

	const handleJobClick = (job: IEmployeeScheduleItem) => {
		const labels = job?.jobDailyRecord?.jobLabelAssignments;
		const isApproved = job?.jobDailyRecord?.notReadyUpdate?.isApproved;
		const jobNewStart =
			!labels.some((label) => label.labelId === legends.jobNotReady) &&
			labels.some((label) => label.labelId === legends.newStart || label.labelId === legends.warrantyJob);
		const isTodayJob = isSameDate(job.jobDailyRecord.date, getTodayDate());

		if (!isApproved && jobNewStart && isTodayJob) {
			openModal({
				variant: "medium",
				modalTitle: (
					<div className="mb-2 text-start">
						<div>
							Job&nbsp;#
							{job.jobDailyRecord.recnum}
							{job.jobDailyRecord.tsknme && <span className="ml-2">{`(${job.jobDailyRecord.tsknme})`}</span>}
							<span className="ml-4 inline-block h-3 w-3 rounded-full bg-brand-greenAccent"></span>
						</div>
						<div>
							<span className="text-sm font-semibold text-brand-dark50">{tEmployee.newStartJob}</span>
						</div>
					</div>
				),
				subHeader: tEmployee.updateFieldsForCrewNotification,

				modalView: (
					<JobNewStartModal
						onClose={handleClose}
						dailyJob={job.jobDailyRecord}
						assignmentId={job.assignmentId}
						didNotWork={job?.didNotWorked ? true : false}
					/>
				),
			});
		} else {
			handleRouter(job.assignmentId);
		}
	};

	const showGPSNotWorkingBanner =
		isCurrentDate &&
		(gpsWorkingData?.isGPSWorking === false ||
			(gpsWorkingData?.isGPSWorking === true && gpsWorkingData.markedOnlineAtByEmployee));

	const NewJobRequestButton = () => {
		if (hideMiddayStopButton) return null;

		return (
			<div className="w-full px-2">
				<Button
					onClick={() => router.push(`${routes.employee.middayStop}?startDate=${startDate}`)}
					className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-brand-dark bg-white px-6 text-base font-semibold text-brand-dark dark:bg-gray-800"
				>
					<FaRegSquarePlus size={20} />
					{tEmployee.addNewJobRequest}
				</Button>
			</div>
		);
	};

	if (isJobLoading) {
		return <Spinner />;
	}

	return (
		<>
			<div className="space-y-2">
				<div className="rounded-[8px] px-4">
					{holiday?.type && <HolidayBanner holiday={holiday} />}

					<LockScreenBanner pendingLogs={pendingLogs} />

					{showGPSNotWorkingBanner && <GpsNotWorkingBanner gpsWorkingData={gpsWorkingData} />}

					{<GpsAfterHourUsageBanner date={dateToUTCString(startDate)} roster={rosterData} />}

					{/* Top status bars */}
					{!isTimeLogPending &&
						employeeDayTime &&
						(isLatenessResponseSentOrHandled && isEarlyQuitResponseSentOrHandled ? (
							<LateEarlyStatusTopBar employeeDayTime={employeeDayTime} />
						) : isLatenessResponseSentOrHandled ? (
							<LateStatusTopBar employeeDayTime={employeeDayTime} />
						) : isEarlyQuitResponseSentOrHandled ? (
							<EarlyStatusTopBar employeeDayTime={employeeDayTime} />
						) : null)}

					{/* ask lateness questions from those user's whose time is track via GPS only*/}
					{
						<>
							{employeeDayTime &&
							showLateBanner &&
							showEarlyBanner &&
							!isLatenessResponseSentOrHandled &&
							!isEarlyQuitResponseSentOrHandled ? (
								<div
									className={cn(
										"w-full rounded bg-brand-red800/10 py-2 text-left font-inter text-xs font-medium text-brand-red800"
									)}
								>
									<div>
										A late arrival and early quit were recorded for today.{" "}
										<span
											className="cursor-pointer underline underline-offset-4"
											onClick={() => {
												openModal({
													variant: "default",
													modalTitle: tEmployee.mightHaveBeenLateAndEarlyToday,
													subHeader: tEmployee.lateEarlyConfirmation,
													modalView: (
														<LateEarlyStatusModal
															onClose={closeModal}
															employeeDayTimeId={employeeDayTime.id}
															rosterStartTime={rosterData?.extendedApprovedStartTime || rosterData?.dayStartTime}
															loggedStartTime={employeeDayTime?.overrideStartTime || employeeDayTime?.dayStartTime}
															rosterEndTime={rosterData?.extendedApprovedEndTime || rosterData?.dayEndTime}
															loggedEndTime={employeeDayTime?.overrideEndTime || employeeDayTime?.dayEndTime}
														/>
													),
												});
											}}
										>
											Did you?
										</span>
									</div>
								</div>
							) : (
								<>
									{/* LATE ONLY */}
									{employeeDayTime && showLateBanner && !isLatenessResponseSentOrHandled && (
										<div
											className={cn(
												"w-full rounded bg-brand-red800/10 py-2 text-left font-inter text-xs font-medium text-brand-red800"
											)}
										>
											<div>
												You may have been late today.{" "}
												<span
													className="cursor-pointer underline underline-offset-4"
													onClick={() => {
														openModal({
															variant: "default",
															modalTitle: tEmployee.mightHaveBeenLateToday,
															subHeader: tEmployee.indicateArrivedLate,
															modalView: (
																<LateStatusModal
																	onClose={closeModal}
																	employeeDayTimeId={employeeDayTime.id}
																	rosterStartTime={rosterData?.extendedApprovedStartTime || rosterData?.dayStartTime}
																	loggedStartTime={employeeDayTime?.overrideStartTime || employeeDayTime?.dayStartTime}
																/>
															),
														});
													}}
												>
													Were you late?
												</span>
											</div>
										</div>
									)}

									{/* EARLY ONLY */}
									{employeeDayTime && showEarlyBanner && !isEarlyQuitResponseSentOrHandled && (
										<div
											className={cn(
												"w-full rounded bg-brand-red800/10 py-2 text-center font-inter text-xs font-medium text-brand-red800"
											)}
										>
											<div>
												{tEmployee.mightHaveLeftEarlyToday}{" "}
												<span
													className="cursor-pointer underline underline-offset-4"
													onClick={() => {
														openModal({
															variant: "default",
															modalTitle: tEmployee.mightHaveLeftEarlyToday,
															subHeader: tEmployee.indicateLeftEarlyYesNo,
															modalView: (
																<EarlyStatusModal
																	onClose={closeModal}
																	employeeDayTimeId={employeeDayTime.id}
																	rosterEndTime={rosterData?.extendedApprovedEndTime || rosterData?.dayEndTime}
																	loggedEndTime={employeeDayTime?.overrideEndTime || employeeDayTime?.dayEndTime}
																/>
															),
														});
													}}
												>
													{tEmployee.didYouLeaveEarly}
												</span>
											</div>
										</div>
									)}
								</>
							)}
						</>
					}
				</div>

				{jobs?.length ? (
					<>
						<div className="space-y-2">
							{jobs.map((job, ind) => (
								<JobCard
									key={`${job.id}${ind}`}
									job={job}
									totalStops={jobs.length}
									onClick={() => handleJobClick(job)}
								/>
							))}
						</div>
					</>
				) : isJobLoading ? (
					<div className="flex h-64 items-center justify-center">
						<div className="max-w-sm rounded-xl border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
							<p className="text-sm font-normal text-brand-lightgrey dark:text-gray-100">{tEmployee.loading}</p>
						</div>
					</div>
				) : (
					<div className="flex min-h-[30vh] w-full flex-col justify-end gap-2 px-4 text-center">
						<p className="text-xl font-normal text-brand-dark dark:text-gray-100">
							{holiday?.type === holidayTypes.HOLIDAY || holiday?.name === holidayTypes.HOLIDAY
								? tEmployee.holiday
								: tEmployee.noJobsAvailable}
						</p>
					</div>
				)}

				{showSelScheduleButton && <SelfScheduleAddJobTrigger setSelfScheduleOpen={setSelfScheduleOpen} />}

				<AddNewStopButton employeeSchedules={jobs || []} isTimeLogPending={isTimeLogPending} />

				{MDTRequests?.length && MDTRequests?.length > 0 ? (
					<div className="space-y-2">
						{MDTRequests.map((request) => (
							<MDTRequestsCard key={request.id} request={request} />
						))}
					</div>
				) : (
					<div></div>
				)}

				<div>
					<NewJobRequestButton />
				</div>
			</div>
			<Modal />
		</>
	);
}
