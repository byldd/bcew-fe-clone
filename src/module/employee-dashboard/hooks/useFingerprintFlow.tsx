"use client";

import { useCallback, useRef, useState } from "react";
import { dateToUTCString, getTodayDate, isSameDate, toDate } from "@/lib/utils/date";
import { useGetFingerprintApprovalStatus } from "./useFingerprintActionRequest";
import { useEmployeeSchedules, useEmployeeTodayRoster } from "@/module/job/hooks/useEmployeeSchedule";
import FingerprintNotRecordedModal from "../components/fingerprint-not-recorded-modal";
import FingerprintActionRequestModal from "../components/fingerprint-action-request-modal";
import { IEmployeeLockStatus } from "@/module/job/types";
import { IOpenModal } from "@/types";
import { useEmployeeScheduleParams } from "@/module/job/hooks/useEmployeeScheduleParams";
import { TimeSource } from "@/module/schedule-management/roster-time-configuration/enums";

interface UseFingerprintFlowParams {
	isFingerprintEnabled: boolean | undefined;
	data: IEmployeeLockStatus | undefined;
	openModal: (config: IOpenModal) => void;
	closeModal: () => void;
	setParams: ReturnType<typeof useEmployeeScheduleParams>["setParams"];
}

export const useFingerprintFlow = ({
	isFingerprintEnabled,
	data,
	openModal,
	closeModal,
	setParams,
}: UseFingerprintFlowParams) => {
	const [processDate, setProcessDate] = useState<string | null>(null);
	const processedDates = useRef<Set<string>>(new Set());

	const checkDate = isFingerprintEnabled ? (processDate ?? data?.date ?? "") : "";

	const { data: rosterForDate, isLoading: isCheckingRoster } = useEmployeeTodayRoster({ date: checkDate });
	const { data: schedulesForDate, isLoading: isCheckingSchedule } = useEmployeeSchedules({ startDate: checkDate });
	const { data: fingerprintApprovalStatus, isLoading: isCheckingApproval } = useGetFingerprintApprovalStatus({
		date: checkDate,
	});

	const advanceToNextDay = useCallback(
		(fromDate: string) => {
			const next = toDate(fromDate);
			next.setDate(next.getDate() + 1);
			if (next >= getTodayDate()) {
				setProcessDate(null);
				setParams({ startDate: getTodayDate() });
			} else {
				setProcessDate(dateToUTCString(next));
			}
		},
		[setParams]
	);

	const handleFingerprintFlow = useCallback(() => {
		const current = data?.date;
		if (!current) {
			return;
		}

		// if (!data?.isTimeLogPending || !data.date) {
		// 	if (processDate !== null) setProcessDate(null);
		// 	return;
		// }

		// const current = processDate ?? data.date;

		// if (isSameDate(current, getTodayDate()) || toDate(current) > getTodayDate()) {
		// 	setProcessDate(null);
		// 	setParams({ startDate: getTodayDate() });
		// 	return;
		// }

		// if (isCheckingRoster || isCheckingSchedule || isCheckingApproval) return;
		// if (processedDates.current.has(current)) return;

		// const skip = () => {
		// 	processedDates.current.add(current);
		// 	advanceToNextDay(current);
		// };

		// if (rosterForDate?.timeSource === TimeSource.NOT_WORKING) return skip();
		// if (!schedulesForDate?.length) return skip();
		// if (fingerprintApprovalStatus?.id) return skip();

		// processedDates.current.add(current);
		// setParams({ startDate: toDate(current), screenLockout: "true" });
		openModal({
			modalTitle: "Fingerprint Not Recorded.",
			showDefaultClose: false,
			modalView: (
				<FingerprintNotRecordedModal
					date={current}
					onLeave={() => {
						closeModal();
						advanceToNextDay(current);
					}}
					onWorking={() =>
						openModal({
							modalTitle: "Request Admin Approval",
							modalView: (
								<FingerprintActionRequestModal
									date={current}
									onSuccess={() => {
										closeModal();
									}}
								/>
							),
							variant: "default",
						})
					}
				/>
			),
		});
	}, [closeModal, openModal, data, advanceToNextDay]);

	return { handleFingerprintFlow };
};
