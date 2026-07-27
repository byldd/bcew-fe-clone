"use client";

import { Button } from "@/components/ui/button";
import { StartDayModalContent } from "@/module/employee-dashboard/components/start-my-day-modal-content";
import { usePathname } from "next/navigation";
import { routes } from "@/config/routes";
import React, { useState } from "react";
import RunningTimer from "./running-timer";
import { EndDayModalContent } from "./end-my-day-modal";
import { IModalWrapperProps } from "../types";
import { X } from "lucide-react";
import { TEAM_NAME } from "@/utils/enums";
import {
	useEmployeeTodayRoster,
	useEmployeeVehicles,
	useGetEmployeeData,
} from "@/module/job/hooks/useEmployeeSchedule";
import RequestExtendedTimeModal from "@/module/job/components/request-extended-time-modal";
import { TimeSource } from "@/module/schedule-management/roster-time-configuration/enums";
import CreateTravelPayRequestModal from "./travel-pay/create-travel-pay-request-modal";
import { PrimaryButtonState } from "../utils/enums";
import PrimaryButtons from "./primary-buttons";
import { dateToUTCString, getTodayDate, isSameDate, toDate } from "@/lib/utils/date";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { GPSPreviewModal } from "./gps-preview-modal/gps-preview-modal";
import { FingerprintPreviewModal } from "./fingerprint-preview-modal/fingerprint-preview-modal";
import { useEmployeeScheduleParams } from "@/module/job/hooks/useEmployeeScheduleParams";
import { usePendingLatenessGuard } from "@/module/job/hooks/usePendingLatenessGuard";
import { useModal } from "@/hooks/useModal";
import useAuthStore from "@/store/auth-store";
import { openErrorToast } from "@/components/toast";
import { isEligibleForTravelPay } from "@/module/employee-travel-pay/utils/employee-travel-pay";
import { getUserExemptFromSpecialCardTimeLogging } from "@/module/employee/utils/role";

export function DayActivityActions({
	isTimeLogPending,
	date,
	isMarkedOfflineByEmployee,
	showAllocateButton,
}: {
	isTimeLogPending: boolean | undefined;
	date: string | undefined;
	isMarkedOfflineByEmployee: boolean | undefined;
	showAllocateButton?: boolean;
}) {
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	const { openModal, closeModal, Modal } = useModal();
	const { PendingLatenessModal, guardPendingLateness } = usePendingLatenessGuard();

	const pathname = usePathname();
	const [vehicleNumber, setVehicleNumber] = useState<string>();
	const { getParams } = useEmployeeScheduleParams();
	const { startDate } = getParams();
	const [showStartDayModal, setShowStartDayModal] = useState(false);
	const [showEndDayModal, setShowEndDayModal] = useState(false);
	const [showGpsPreviewModal, setShowGpsPreviewModal] = useState(false);
	const [showFingerprintPreviewModal, setShowFingerprintPreviewModal] = useState(false);
	const { user: authUser } = useAuthStore();

	const [showExtendTimeModal, setShowExtendTimeModal] = useState(false);
	const { data: user } = useGetEmployeeData(dateToUTCString(startDate));
	const { dayStartTime, dayEndTime } = user?.employee?.employeeDayTimes?.[0] || {};
	const isSubContractor = pathname?.includes(routes.subContractor.adminDashboard);
	const isGPSTimeLogAllowed = user?.employee?.user?.role?.trackTimeByGPS;

	const isSpecialCardTimeLoggingExempt =
		user &&
		authUser?.role &&
		getUserExemptFromSpecialCardTimeLogging({
			user,
			userRole: authUser?.role,
		});

	const isFingerprintEnabled = user?.isFingerprintEnabled === true;

	const canSendTravelPayRequest = isEligibleForTravelPay({ user: authUser });

	const isToday = date ? isSameDate(toDate(date), getTodayDate()) : true;
	const { data: vehicleData } = useEmployeeVehicles(dateToUTCString(startDate));
	const shouldDisableTimeLog = false;
	const isVehicleAssigned =
		vehicleData?.[0]?.assignedTime && isSameDate(toDate(vehicleData?.[0]?.assignedTime), getTodayDate()) ? true : false;
	const { data: todayRosterTime } = useEmployeeTodayRoster({ date: dateToUTCString(startDate) });
	const isPastDate = toDate(startDate) < getTodayDate();

	const onSendNewRequest = () => {
		openModal({
			modalView: <CreateTravelPayRequestModal onClose={closeModal} />,
			modalTitle: "Request Travel Pay",
		});
	};

	if (isSubContractor) {
		return null;
	}

	const getExtendedTimeButton = () => {
		if ((isTimeLogPending && !isToday) || isPastDate || isSpecialCardTimeLoggingExempt) return null;
		return (
			<Button
				variant="outline"
				className="px-2"
				disabled={!todayRosterTime || todayRosterTime?.timeSource === TimeSource.NOT_WORKING}
				onClick={(e) => {
					e.stopPropagation();
					setShowExtendTimeModal(true);
				}}
			>
				Extend Time
			</Button>
		);
	};

	const handleTimerClick = () => {
		if (isGPSTimeLogAllowed) {
			setShowGpsPreviewModal(true);
		} else {
			setShowEndDayModal(true);
		}
	};

	const handleFingerprintClick = () => {
		setShowFingerprintPreviewModal(true);
	};

	const getPrimaryButtonState = (): PrimaryButtonState => {
		if (isFingerprintEnabled) return PrimaryButtonState.FINGERPRINT_RESTRICTED;
		if (dayEndTime) return PrimaryButtonState.UPDATE_LOGGED_TIME;
		if (isPastDate) {
			return PrimaryButtonState.MANUAL_LOG;
		}

		if (isMarkedOfflineByEmployee) return PrimaryButtonState.MANUAL_LOG;

		if (isGPSTimeLogAllowed && dayStartTime && !dayEndTime) return PrimaryButtonState.RUNNING_TIMER;

		if (isGPSTimeLogAllowed) return PrimaryButtonState.GPS_RESTRICTED;

		return PrimaryButtonState.MANUAL_LOG;
	};

	if (
		toDate(startDate) > getTodayDate() ||
		(!isSameDate(startDate, getTodayDate()) && dayEndTime && !isFingerprintEnabled)
	) {
		return null;
	}

	return (
		<div className="bg-white">
			<Modal />
			<PendingLatenessModal />
			<div className="fixed bottom-0 left-0 right-0 z-30 flex gap-1 bg-white px-2 py-2">
				{/* TODO: Not using pause time modal for now */}
				{/* <PauseTimeModal /> */}

				{canSendTravelPayRequest && !isPastDate && (
					<Button disabled={isTimeLogPending} variant="outline" className="px-2" onClick={onSendNewRequest}>
						{tEmployee.travelPay}
					</Button>
				)}

				{!isSpecialCardTimeLoggingExempt &&
					(getPrimaryButtonState() === PrimaryButtonState.RUNNING_TIMER ? (
						<RunningTimer
							disabled={shouldDisableTimeLog}
							isGPSTimeLogAllowed={isGPSTimeLogAllowed}
							onHandleTimerClick={() => guardPendingLateness(handleTimerClick)}
						/>
					) : (
						<PrimaryButtons
							state={getPrimaryButtonState()}
							disabled={shouldDisableTimeLog}
							onStart={() => guardPendingLateness(() => setShowStartDayModal(true))}
							onEnd={() => guardPendingLateness(() => setShowEndDayModal(true))}
							onFingerprint={() => guardPendingLateness(handleFingerprintClick)}
							isVehicleAssigned={isVehicleAssigned}
							todayRosterTimeAvailable={
								!!todayRosterTime && todayRosterTime?.timeSource !== TimeSource.NOT_WORKING && !shouldDisableTimeLog
							}
						/>
					))}

				{getExtendedTimeButton()}
			</div>

			{showStartDayModal && (
				<ModalWrapper
					title={tEmployee.logMyDay}
					subHeader={
						<span>
							{tEmployee.verifyVehicle}
							<br />
							{user?.team?.name !== TEAM_NAME?.WAREHOUSE && ""}
						</span>
					}
					onClose={() => setShowStartDayModal(false)}
				>
					<StartDayModalContent
						vehicleNumber={vehicleNumber}
						setVehicleNumber={setVehicleNumber}
						setShowStartDayModal={setShowStartDayModal}
						setShowEndDayModal={setShowEndDayModal}
						vehicleData={vehicleData}
					/>
				</ModalWrapper>
			)}

			{showEndDayModal && (
				<ModalWrapper
					title={dayEndTime ? tEmployee.loggedTime : tEmployee.endMyDay}
					onClose={() => setShowEndDayModal(false)}
				>
					<EndDayModalContent
						vehicleNumber={vehicleNumber}
						setVehicleNumber={setVehicleNumber}
						setShowEndDayModal={setShowEndDayModal}
						isGPSTimeLogAllowed={isGPSTimeLogAllowed!}
					/>
				</ModalWrapper>
			)}

			{showExtendTimeModal && (
				<ModalWrapper title={tEmployee.extendedTimeRequest} onClose={() => setShowExtendTimeModal(false)}>
					<RequestExtendedTimeModal
						onClose={() => setShowExtendTimeModal(false)}
						userRoster={user?.employee?.user?.rosterTimes?.[0]}
					/>
				</ModalWrapper>
			)}

			{showGpsPreviewModal && (
				<ModalWrapper
					title={dayEndTime ? tEmployee.loggedTime : "My Day"}
					onClose={() => setShowGpsPreviewModal(false)}
				>
					<GPSPreviewModal
						vehicleNumber={vehicleNumber}
						setVehicleNumber={setVehicleNumber}
						setShowGpsPreviewModal={setShowGpsPreviewModal}
					/>
				</ModalWrapper>
			)}

			{showFingerprintPreviewModal && (
				<ModalWrapper title={tEmployee.loggedTime} onClose={() => setShowFingerprintPreviewModal(false)}>
					<FingerprintPreviewModal
						showAllocateButton={showAllocateButton}
						setShowFingerprintPreviewModal={setShowFingerprintPreviewModal}
					/>
				</ModalWrapper>
			)}
		</div>
	);
}

function ModalWrapper({ title, subHeader, children, onClose }: IModalWrapperProps) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
			<div className="relative w-full max-w-sm rounded-lg bg-white p-4" onClick={(e) => e.stopPropagation()}>
				<button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700">
					<X className="h-5 w-5" />
				</button>

				<h2 className="font-inter text-xl font-normal text-brand-dark">{title}</h2>
				{subHeader && <p className="mb-4 font-inter text-sm font-medium text-brand-dark60">{subHeader}</p>}
				{children}
			</div>
		</div>
	);
}
