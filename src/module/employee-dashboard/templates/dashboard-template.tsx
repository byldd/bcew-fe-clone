"use client";

import { DashboardHeader } from "@/module/employee-dashboard/components/dashboard-header";
import { WeeklyCalendar } from "@/module/employee-dashboard/components/weekly-calendar";
import { DayActivityActions } from "@/module/employee-dashboard/components/day-activity-actions";
import { JobList } from "../components/job-list";
import {
	useEmployeeDayVarianceStatus,
	useEmployeeLockStatus,
	useEmployeePendingLateness,
} from "@/module/job/hooks/useEmployeeSchedule";
import { useEffect, useState } from "react";
import { useModal } from "@/hooks/useModal";
import { useEmployeeScheduleParams } from "@/module/job/hooks/useEmployeeScheduleParams";
import { useEmployeeGPSWorking } from "../hooks/useGPSWorking";
import { dateToUTCString, getTodayDate, isSameDate, toDate, toFormattedDate } from "@/lib/utils/date";
import SelfScheduleJobForm from "../components/self-schedule/self-schedule-job-form";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import useAuthStore from "@/store/auth-store";
import { isSmsConsentProvided } from "@/module/profile/utils/sms-consent";
import { checkIsFingerprintEnabled } from "@/module/employee-dashboard/utils/is-fingerprint-enabled";
import SmsConsent from "@/components/shared/sms-consent";
import WeekendBanner from "../components/weekend/weekend-banner";
import { useFingerprintFlow } from "../hooks/useFingerprintFlow";
import { useRouter } from "next/navigation";
import AllocateTimeTrigger from "../components/fingerprint-preview-modal/allocate-time-trigger";

export default function DashboardTemplate() {
	const { user } = useAuthStore((state) => state);
	const isFingerprintEnabled = user ? checkIsFingerprintEnabled(user) : false;

	const { data, isFetching } = useEmployeeLockStatus();
	const { openModal, closeModal, Modal } = useModal();
	const { setParams, getParams } = useEmployeeScheduleParams();
	const { isTimeLogPending, date, showAllocateButton, showFingerPrintRequestModal } = data || {};
	const { startDate, screenLockout } = getParams();
	const isToday = date && isSameDate(date, getTodayDate());
	const { data: gpsWorkingData } = useEmployeeGPSWorking();
	const [selfScheduleOpen, setSelfScheduleOpen] = useState(false);
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	const router = useRouter();

	const { data: pendingLateness } = useEmployeePendingLateness(dateToUTCString(startDate));
	const { data: dayVarianceStatus } = useEmployeeDayVarianceStatus(dateToUTCString(startDate));

	const shouldShowLateBanner = dayVarianceStatus?.isLateArrival && dayVarianceStatus?.pendingLate;

	const shouldShowEarlyBanner = dayVarianceStatus?.isEarlyLogout && dayVarianceStatus?.pendingEarly;

	const { handleFingerprintFlow } = useFingerprintFlow({
		isFingerprintEnabled,
		data,
		openModal,
		closeModal,
		setParams,
	});

	// Fingerprint users: never lock the UI — the modal flow handles navigation
	const isUIPending = isFingerprintEnabled ? false : (isTimeLogPending ?? false);

	useEffect(() => {
		if (isFetching) return;

		// Non-fingerprint: original lockout flow unchanged
		if (data && data.date) {
			setParams({ startDate: toDate(data.date), screenLockout: "true" });
			if (showFingerPrintRequestModal) {
				handleFingerprintFlow();
				return;
			} else if (data.isTimeLogPending) {
				openModal({
					modalTitle: tEmployee.actionRequiredLogYourTime,
					modalView: (
						<div className="py-3">
							We noticed you have pending job{isToday ? "/day" : ""} time logs from{" "}
							{date ? (isToday ? "today" : toFormattedDate(date)) : ""}. Please log your time to continue.
						</div>
					),
				});
			}
		} else if (!data?.date && screenLockout && !pendingLateness?.hasPendingReason) {
			/**
			 * If the backend previously returned a lockout date, we set `screenLockout = true`
			 * and navigate to that date.
			 *
			 * After the technician resolves the lockout and returns to the dashboard:
			 * - The URL may still contain `screenLockout = true`
			 * - But the backend no longer returns a lockout date
			 *
			 * In this case, reset the view to today's date.
			 */
			closeModal();
			setParams({ startDate: getTodayDate() });
		}
	}, [
		handleFingerprintFlow,
		closeModal,
		data,
		date,
		isFetching,
		isToday,
		openModal,
		setParams,
		tEmployee.actionRequiredLogYourTime,
		screenLockout,
		isFingerprintEnabled,
		pendingLateness,
		showFingerPrintRequestModal,
	]);

	useEffect(() => {
		if (!user) return;
		if (!isSmsConsentProvided({ user })) {
			openModal({
				modalView: <SmsConsent onClose={closeModal} showCloseButton={false} />,
				showDefaultClose: false,
			});
		}
	}, [user, openModal, closeModal]);

	return (
		<div className="min-h-screen bg-brand-bgLightgrey">
			<DashboardHeader isTimeLogPending={isUIPending} setSelfScheduleOpen={setSelfScheduleOpen} />
			<div className="space-y-4 pb-20 pt-36">
				<WeeklyCalendar
					isEmployee={true}
					isTimeLogPending={isUIPending}
					date={date}
					onDateChange={() => {
						setSelfScheduleOpen(false);
					}}
				/>
				<div className="px-4">
					<WeekendBanner />
				</div>

				{/* {showAllocateButton && <AllocateTimeTrigger date={startDate} />} */}

				{!selfScheduleOpen ? (
					<>
						<JobList
							isTimeLogPending={isUIPending}
							setSelfScheduleOpen={setSelfScheduleOpen}
							gpsWorkingData={gpsWorkingData}
							pendingLogs={data}
							dayVarianceStatus={dayVarianceStatus}
						/>
						<DayActivityActions
							isTimeLogPending={isUIPending}
							date={date}
							isMarkedOfflineByEmployee={gpsWorkingData?.isMarkedOfflineByEmployee}
							showAllocateButton={showAllocateButton}
						/>
					</>
				) : (
					<SelfScheduleJobForm date={dateToUTCString(startDate)} setSelfScheduleOpen={setSelfScheduleOpen} />
				)}
			</div>
			<Modal />
		</div>
	);
}
